import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { parseRoundNumber, getCollectorThreshold, getTieBreakerThreshold, getNoVoteThreshold, getBalanceThreshold, getMultiKillThreshold } from '@/lib/game/constants';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // 1. 获取数据
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_code', code);

    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('room_code', code);

    const { data: predictions, error: predictionsError } = await supabase
      .from('vote_predictions')
      .select('*')
      .eq('room_code', code)
      .is('is_correct', null); // 只获取未验证的预测

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('round_state')
      .eq('code', code)
      .single();

    if (playersError || !players || votesError || !votes || roomError || !room) {
      return NextResponse.json(
        { success: false, error: '数据读取失败' },
        { status: 500 }
      );
    }
    
    const predictionsData = predictions || [];

    const currentRoundNum = parseRoundNumber(room.round_state);
    const totalPlayers = players.length;
    const alivePlayers = players.filter(p => p.is_alive);
    const aliveCount = alivePlayers.length;

    const logs: Array<{ message: string; viewer_ids: number[] | null; tag: 'PUBLIC' | 'PRIVATE' }> = [];
    const playerUpdates: any[] = [];

    // 辅助函数：获取玩家名字
    const getName = (id: number) => {
      const player = players.find(p => p.id === id);
      return player?.name || `未知玩家(${id})`;
    };

    // 2. 计票逻辑
    const voteCounts: Record<number, number> = {};
    players.forEach(p => voteCounts[p.id] = 0);

    // 2.1 基础计票 & 角色权重
    votes.forEach(v => {
      if (!v.target_id) return;
      const voter = players.find(p => p.id === v.voter_id);
      const target = players.find(p => p.id === v.target_id);
      if (!voter || !voter.is_alive) return;

      // [同盟者] 互投无效
      if (voter.role === '同盟者' && voter.flags?.ally_id === v.target_id) return;
      if (target?.role === '同盟者' && target.flags?.ally_id === v.voter_id) return;

      // [双票使者] 权重2
      let weight = (voter.role === '双票使者') ? 2 : 1;
      
      // [投票回收者] 使用存储的票
      if (voter.role === '投票回收者' && voter.stored_votes) {
        weight += voter.stored_votes;
        // 清空存储的票
        playerUpdates.push({
          ...voter,
          stored_votes: 0
        });
      }
      
      voteCounts[v.target_id] += weight;
    });

    // 2.2 [同盟者] 共投检测 (+1)
    const allies = players.filter(p => p.role === '同盟者' && p.is_alive && p.flags?.ally_id);
    allies.forEach(p1 => {
      if (p1.id > p1.flags!.ally_id!) return; // 去重
      const p2 = players.find(p => p.id === p1.flags!.ally_id);
      if (p2 && p2.is_alive) {
        const v1 = votes.find(v => v.voter_id === p1.id);
        const v2 = votes.find(v => v.voter_id === p2.id);
        if (v1?.target_id && v2?.target_id && v1.target_id === v2.target_id) {
          voteCounts[v1.target_id] += 1;
        }
      }
    });

    // 2.3 防御与减票
    players.forEach(p => {
      if (p.role === '减票守护者' && voteCounts[p.id] > 0) {
        voteCounts[p.id] -= 1;
      }
      if (p.flags?.is_protected) {
        voteCounts[p.id] = 0;
      }
    });

    // 3. 胜利判定 I (投票结算前触发)
    let winner: any = null;
    let winReason = '';
    let victoryStealTarget: any = null; // 胜利夺取者目标

    // 3.0 [胜利夺取者] 检查（在判定其他胜利前）
    const victoryStealer = players.find(p => 
      p.role === '胜利夺取者' && 
      p.is_alive && 
      p.flags?.victory_steal_target_id
    );
    if (victoryStealer) {
      victoryStealTarget = players.find(p => p.id === victoryStealer.flags?.victory_steal_target_id);
    }

    // 3.1 [集票胜者]
    const collector = players.find(p => p.role === '集票胜者' && p.is_alive);
    if (collector && voteCounts[collector.id] >= getCollectorThreshold(aliveCount) && voteCounts[collector.id] > 0) {
      // 检查是否被胜利夺取者夺取
      if (victoryStealer && victoryStealTarget && victoryStealTarget.id === collector.id) {
        winner = victoryStealer;
        winReason = `【胜利夺取者】夺取了【集票胜者】的胜利条件，获胜！`;
      } else {
        winner = collector;
        winReason = '【集票胜者】获得超过 2/3 票数，直接获胜！';
      }
    }

    // 4. 处决逻辑
    let maxVotes = 0;
    Object.values(voteCounts).forEach(c => { if (c > maxVotes) maxVotes = c; });
    const candidates = Object.keys(voteCounts).filter(id => voteCounts[parseInt(id)] === maxVotes).map(Number);
    let eliminatedPlayerId: number | null = null;
    let actualEliminatedId: number | null = null; // 实际被处决的玩家ID（考虑命运转移）

    if (!winner) {
      if (maxVotes === 0) {
        logs.push({ message: '今日无人投票。', viewer_ids: null, tag: 'PUBLIC' });
      } else if (candidates.length > 1) {
        // === 平票 ===
        const names = candidates.map(id => getName(id)).join(', ');
        logs.push({ message: `平票！${names} 均获得 ${maxVotes} 票。无人出局。`, viewer_ids: null, tag: 'PUBLIC' });

        // 4.1 [平票赢家]
        const tieWinner = players.find(p => p.role === '平票赢家' && p.is_alive && candidates.includes(p.id));
        if (tieWinner) {
          // 检查是否被胜利夺取者夺取
          if (victoryStealer && victoryStealTarget && victoryStealTarget.id === tieWinner.id) {
            winner = victoryStealer;
            winReason = `【胜利夺取者】夺取了【平票赢家】的胜利条件，获胜！`;
          } else {
            winner = tieWinner;
            winReason = '【平票赢家】在平局中幸存并获胜！';
          }
        }

        // 4.2 [平票终结者]
        const tieBreaker = players.find(p => p.role === '平票终结者' && p.is_alive);
        if (tieBreaker) {
          const streak = (tieBreaker.flags?.tie_streak || 0) + 1;
          const threshold = getTieBreakerThreshold(totalPlayers);
          playerUpdates.push({
            ...tieBreaker,
            flags: { ...tieBreaker.flags, tie_streak: streak }
          });
                if (streak >= threshold) {
                  // 检查是否被胜利夺取者夺取
                  if (victoryStealer && victoryStealTarget && victoryStealTarget.id === tieBreaker.id) {
                    winner = victoryStealer;
                    winReason = `【胜利夺取者】夺取了【平票终结者】的胜利条件，获胜！`;
                  } else {
                    winner = tieBreaker;
                    winReason = `【平票终结者】连续 ${streak} 局平票，获胜！`;
                  }
                }
        }

        // 4.3 [均衡守护者] 打破平局
        const balanceGuard = players.find(p => p.role === '均衡守护者' && p.is_alive && !p.balance_guard_used);
        if (balanceGuard) {
          // 如果均衡守护者使用了技能，打破平局（这里需要前端触发）
          // 暂时跳过，等待前端实现
        }
        } else {
          // === 正常处决 ===
          eliminatedPlayerId = candidates[0];
          const eliminated = players.find(p => p.id === eliminatedPlayerId);
          let actualEliminatedId = eliminatedPlayerId;
          
          if (eliminated) {
            // 4.4 [反向投票者] 反击
            if (eliminated.role === '反向投票者' && !eliminated.reverse_vote_used) {
              // 找到投他的人
              const voters = votes.filter(v => v.target_id === eliminated.id).map(v => v.voter_id);
              if (voters.length > 0) {
                // 随机选择一个投他的人代替出局
                const targetVoterId = voters[Math.floor(Math.random() * voters.length)];
                const targetVoter = players.find(p => p.id === targetVoterId);
                if (targetVoter && targetVoter.is_alive) {
                  actualEliminatedId = targetVoterId;
                  playerUpdates.push({
                    ...eliminated,
                    reverse_vote_used: true
                  });
                  logs.push({
                    message: `【反向投票者】发动反击！玩家【${getName(targetVoterId)}】代替出局。`,
                    viewer_ids: null,
                    tag: 'PUBLIC'
                  });
                }
              }
            }

            // [命运转移者] 检查是否需要调换
            if (actualEliminatedId !== null) {
              const actualEliminated = players.find(p => p.id === actualEliminatedId);
              if (actualEliminated && actualEliminated.fate_target_id) {
                // 命运转移：实际出局的是转移目标
                const transferTarget = players.find(p => p.id === actualEliminated.fate_target_id);
                if (transferTarget && transferTarget.is_alive) {
                  const oldEliminatedId = actualEliminatedId;
                  actualEliminatedId = actualEliminated.fate_target_id;
                  playerUpdates.push({
                    ...transferTarget,
                    is_alive: false,
                    death_round: currentRoundNum,
                    death_type: 'VOTE'
                  });
                  logs.push({
                    message: `【命运转移者】命运调换生效！玩家【${getName(oldEliminatedId)}】被投票，但玩家【${getName(actualEliminatedId)}】代替出局。`,
                    viewer_ids: null,
                    tag: 'PUBLIC'
                  });
                }
              } else {
                // 正常处决
                playerUpdates.push({
                  ...actualEliminated,
                  is_alive: false,
                  death_round: currentRoundNum,
                  death_type: 'VOTE'
                });
                logs.push({
                  message: `玩家【${getName(actualEliminatedId)}】被投票出局。`,
                  viewer_ids: null,
                  tag: 'PUBLIC'
                });
              }

              // [命运复制者] 如果复制的目标死亡，自己也死亡
              const finalEliminatedId = actualEliminatedId;
              const copyFatePlayers = players.filter(p => 
                p.role === '命运复制者' && 
                p.is_alive && 
                p.copied_from_id === finalEliminatedId
              );
              copyFatePlayers.forEach(copyPlayer => {
                playerUpdates.push({
                  ...copyPlayer,
                  is_alive: false,
                  death_round: currentRoundNum,
                  death_type: 'SKILL'
                });
                logs.push({
                  message: `【命运复制者】玩家【${getName(copyPlayer.id)}】因复制的目标死亡而一同出局。`,
                  viewer_ids: null,
                  tag: 'PUBLIC'
                });
              });
            }
          }

          // 4.5 [影子胜者] 追魂
          const finalEliminatedId = actualEliminatedId || eliminatedPlayerId;
          if (finalEliminatedId !== null) {
            const shadowWinner = players.find(p => 
              p.role === '影子胜者' && 
              p.is_alive && 
              p.flags?.shadow_target_id === finalEliminatedId
            );
          if (shadowWinner) {
            // 检查是否被胜利夺取者夺取
            if (victoryStealer && victoryStealTarget && victoryStealTarget.id === shadowWinner.id) {
              winner = victoryStealer;
              winReason = `【胜利夺取者】夺取了【影子胜者】的胜利条件，获胜！`;
            } else {
              winner = shadowWinner;
              winReason = '【影子胜者】的目标被投出，获胜！';
            }
          }

          // 4.6 [三人王者] 检查
          const finalEliminatedId = actualEliminatedId || eliminatedPlayerId;
          const remainingAlive = players.filter(p => p.is_alive && p.id !== finalEliminatedId);
          if (remainingAlive.length === 3) {
            const threeKing = remainingAlive.find(p => p.role === '三人王者');
            if (threeKing) {
              // 检查是否被胜利夺取者夺取
              if (victoryStealer && victoryStealTarget && victoryStealTarget.id === threeKing.id) {
                winner = victoryStealer;
                winReason = `【胜利夺取者】夺取了【三人王者】的胜利条件，获胜！`;
              } else {
                winner = threeKing;
                winReason = '【三人王者】在仅剩3人时获胜！';
              }
            }
          }
        }
      }
    }

    // 5. 胜利判定 II (计数型胜利)
    if (!winner) {
      // 5.1 [免票胜者]
      const noVoteWinner = players.find(p => p.role === '免票胜者' && p.is_alive);
      if (noVoteWinner) {
        const streak = (noVoteWinner.flags?.no_vote_streak || 0) + (voteCounts[noVoteWinner.id] === 0 ? 1 : 0);
        const threshold = getNoVoteThreshold(totalPlayers);
        playerUpdates.push({
          ...noVoteWinner,
          flags: { ...noVoteWinner.flags, no_vote_streak: streak }
        });
            if (streak >= threshold) {
              // 检查是否被胜利夺取者夺取
              if (victoryStealer && victoryStealTarget && victoryStealTarget.id === noVoteWinner.id) {
                winner = victoryStealer;
                winReason = `【胜利夺取者】夺取了【免票胜者】的胜利条件，获胜！`;
              } else {
                winner = noVoteWinner;
                winReason = `【免票胜者】连续 ${streak} 局未被投票，获胜！`;
              }
            } else {
          // 重置
          playerUpdates.push({
            ...noVoteWinner,
            flags: { ...noVoteWinner.flags, no_vote_streak: 0 }
          });
        }
      }

      // 5.2 [票数平衡者]
      const balanceWinner = players.find(p => p.role === '票数平衡者' && p.is_alive);
      if (balanceWinner) {
        const currentVotes = voteCounts[balanceWinner.id];
        const lastVotes = balanceWinner.flags?.last_vote_count;
        if (lastVotes !== undefined && currentVotes === lastVotes) {
          const streak = (balanceWinner.flags?.balance_streak || 0) + 1;
          const threshold = getBalanceThreshold(totalPlayers);
          playerUpdates.push({
            ...balanceWinner,
            flags: {
              ...balanceWinner.flags,
              balance_streak: streak,
              last_vote_count: currentVotes
            }
          });
          if (streak >= threshold) {
            // 检查是否被胜利夺取者夺取
            if (victoryStealer && victoryStealTarget && victoryStealTarget.id === balanceWinner.id) {
              winner = victoryStealer;
              winReason = `【胜利夺取者】夺取了【票数平衡者】的胜利条件，获胜！`;
            } else {
              winner = balanceWinner;
              winReason = `【票数平衡者】连续 ${streak} 局得票相同，获胜！`;
            }
          }
        } else {
          playerUpdates.push({
            ...balanceWinner,
            flags: {
              ...balanceWinner.flags,
              balance_streak: 1,
              last_vote_count: currentVotes
            }
          });
        }
      }

      // 5.4 [心灵胜者] 预测验证
      const mindReader = players.find(p => p.role === '心灵胜者' && p.is_alive);
      if (mindReader && !winner) {
        // 获取该玩家的预测记录
        const prediction = predictionsData.find(p => p.predictor_id === mindReader.id);
        if (prediction) {
          // 查找被预测玩家的实际投票
          const predictedVote = votes.find(v => v.voter_id === prediction.predicted_player_id);
          const isCorrect = predictedVote && (
            (prediction.predicted_target_id === null && predictedVote.target_id === null) ||
            (prediction.predicted_target_id === predictedVote.target_id)
          );
          
          // 更新预测记录
          await supabase
            .from('vote_predictions')
            .update({ is_correct: isCorrect })
            .eq('id', prediction.id);
          
          if (isCorrect) {
            const streak = (mindReader.flags?.mind_reader_streak || 0) + 1;
            const threshold = Math.ceil(totalPlayers / 2);
            playerUpdates.push({
              ...mindReader,
              flags: {
                ...mindReader.flags,
                mind_reader_streak: streak
              }
            });
            if (streak >= threshold) {
              // 检查是否被胜利夺取者夺取
              if (victoryStealer && victoryStealTarget && victoryStealTarget.id === mindReader.id) {
                winner = victoryStealer;
                winReason = `【胜利夺取者】夺取了【心灵胜者】的胜利条件，获胜！`;
              } else {
                winner = mindReader;
                winReason = `【心灵胜者】连续 ${streak} 次预测成功，获胜！`;
              }
            } else {
              logs.push({
                message: `预测成功！连续 ${streak}/${threshold} 次。`,
                viewer_ids: [mindReader.id],
                tag: 'PRIVATE'
              });
            }
          } else {
            // 预测失败，重置
            playerUpdates.push({
              ...mindReader,
              flags: {
                ...mindReader.flags,
                mind_reader_streak: 0
              }
            });
            logs.push({
              message: '预测失败，连胜已重置。',
              viewer_ids: [mindReader.id],
              tag: 'PRIVATE'
            });
          }
        }
      }

      // 5.5 [多选胜者]
      const multiKillWinner = players.find(p => p.role === '多选胜者' && p.is_alive);
      if (multiKillWinner && !winner) {
        const vote = votes.find(v => v.voter_id === multiKillWinner.id);
        if (vote && vote.target_id !== null) {
          const voteHistory = multiKillWinner.flags?.vote_history || [];
          const newHistory = [...voteHistory, vote.target_id];
          const uniqueHistory = Array.from(new Set(newHistory));
          
          // 检查是否连续投死不同人
          const targetPlayer = players.find(p => p.id === vote.target_id);
          if (targetPlayer && !targetPlayer.is_alive) {
            const streak = uniqueHistory.length;
            const threshold = getMultiKillThreshold(totalPlayers);
            playerUpdates.push({
              ...multiKillWinner,
              flags: { ...multiKillWinner.flags, vote_history: newHistory }
            });
            if (streak >= threshold) {
              // 检查是否被胜利夺取者夺取
              if (victoryStealer && victoryStealTarget && victoryStealTarget.id === multiKillWinner.id) {
                winner = victoryStealer;
                winReason = `【胜利夺取者】夺取了【多选胜者】的胜利条件，获胜！`;
              } else {
                winner = multiKillWinner;
                winReason = `【多选胜者】连续投死 ${streak} 个不同玩家，获胜！`;
              }
            }
          }
        }
      }
    }

    // 6. 更新玩家状态
    if (playerUpdates.length > 0) {
      await supabase.from('players').upsert(playerUpdates);
    }

    // 7. 插入日志
    if (logs.length > 0) {
      const logsPayload = logs.map(l => ({
        room_code: code,
        message: l.message,
        viewer_ids: l.viewer_ids,
        tag: l.tag
      }));
      await supabase.from('game_logs').insert(logsPayload);
    }

    // 8. 死局检测
    // 计算当前状态哈希（存活玩家ID列表 + 投票结果）
    const aliveIds = players.filter(p => p.is_alive).map(p => p.id).sort().join(',');
    const voteHash = Object.entries(voteCounts)
      .filter(([_, count]) => count > 0)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([id, count]) => `${id}:${count}`)
      .join(',');
    const stateHash = `${aliveIds}|${voteHash}`;

    // 获取最近的状态记录
    const { data: recentStates } = await supabase
      .from('game_states')
      .select('state_hash')
      .eq('room_code', code)
      .order('created_at', { ascending: false })
      .limit(3);

    // 检查是否连续3次相同
    const sameCount = recentStates?.filter(s => s.state_hash === stateHash).length || 0;
    if (sameCount >= 2) { // 加上当前这次就是3次
      // 死局判定
      await supabase.from('game_logs').insert({
        room_code: code,
        message: '⚠️ 死局！连续3次出现相同情况，游戏结束。',
        viewer_ids: null,
        tag: 'PUBLIC'
      });

      await supabase
        .from('rooms')
        .update({ round_state: 'GAME OVER' })
        .eq('code', code);

      return NextResponse.json({
        success: true,
        message: '游戏结束（死局）',
        deadlock: true
      });
    }

    // 保存当前状态（用于死局检测）
    try {
      await supabase.from('game_states').insert({
        room_code: code,
        round_number: currentRoundNum,
        state_hash: stateHash
      });
    } catch {
      // 忽略插入错误（可能是表不存在或权限问题）
    }

    // 9. 检查游戏结束
    // 需要排除被处决的玩家和命运复制者
    const finalEliminatedId = actualEliminatedId || eliminatedPlayerId;
    const remainingAlive = players.filter(p => {
      if (!p.is_alive) return false;
      if (finalEliminatedId && p.id === finalEliminatedId) return false;
      // 排除命运复制者（如果复制的目标被处决）
      if (p.role === '命运复制者' && p.copied_from_id === finalEliminatedId) return false;
      return true;
    });
    const finalAliveCount = remainingAlive.length;

    if (winner) {
      // 游戏结束 - 有胜利者
      await supabase
        .from('rooms')
        .update({ round_state: 'GAME OVER' })
        .eq('code', code);
      
      await supabase.from('game_logs').insert({
        room_code: code,
        message: `🎉 游戏结束！【${winner.name}】${winReason}`,
        viewer_ids: null,
        tag: 'PUBLIC'
      });

      return NextResponse.json({
        success: true,
        message: '游戏结束',
        winner: {
          id: winner.id,
          name: winner.name,
          role: winner.role,
          reason: winReason
        }
      });
    } else if (finalAliveCount <= 1) {
      // 游戏结束 - 无人获胜
      await supabase
        .from('rooms')
        .update({ round_state: 'GAME OVER' })
        .eq('code', code);
      
      await supabase.from('game_logs').insert({
        room_code: code,
        message: '游戏结束，无人获胜。',
        viewer_ids: null,
        tag: 'PUBLIC'
      });

      return NextResponse.json({
        success: true,
        message: '游戏结束，无人获胜'
      });
    } else {
      // 继续游戏 - 切换到下一夜
      const nextRoundStr = `NIGHT ${currentRoundNum + 1}`;
      await supabase
        .from('rooms')
        .update({ round_state: nextRoundStr })
        .eq('code', code);

      // 清空投票
      await supabase
        .from('votes')
        .delete()
        .eq('room_code', code);

      return NextResponse.json({
        success: true,
        message: '白天结算完成，进入下一夜'
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '服务器错误', details: error.message },
      { status: 500 }
    );
  }
}

