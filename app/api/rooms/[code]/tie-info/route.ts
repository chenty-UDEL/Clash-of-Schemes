import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { parseRoundNumber, isDayPhase } from '@/lib/game/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // 获取当前投票和玩家数据
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('room_code', code);

    const { data: votes } = await supabase
      .from('votes')
      .select('*')
      .eq('room_code', code);

    const { data: room } = await supabase
      .from('rooms')
      .select('round_state')
      .eq('code', code)
      .single();

    if (!players || !votes || !room || !isDayPhase(room.round_state)) {
      return NextResponse.json({
        success: false,
        isTie: false
      });
    }

    // 计算票数（与process-day逻辑一致）
    const voteCounts: Record<number, number> = {};
    players.forEach(p => voteCounts[p.id] = 0);

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
      
      // [投票回收者] 使用存储的投票
      if (voter.role === '投票回收者' && voter.stored_votes) {
        weight += voter.stored_votes;
      }
      
      voteCounts[v.target_id] += weight;
    });

    // [同盟者] 共投检测 (+1)
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

    // [减票守护者] 减票
    players.forEach(p => {
      if (p.role === '减票守护者' && voteCounts[p.id] > 0) {
        voteCounts[p.id] -= 1;
      }
      // [利他守护者] 保护（这里不处理，因为保护是夜晚技能）
    });

    // 检查是否平票
    const maxVotes = Math.max(...Object.values(voteCounts), 0);
    const candidates = Object.keys(voteCounts)
      .filter(id => voteCounts[parseInt(id)] === maxVotes)
      .map(Number);

    const isTie = candidates.length > 1 && maxVotes > 0;

    return NextResponse.json({
      success: true,
      isTie,
      candidates: isTie ? candidates : []
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '服务器错误', details: error.message },
      { status: 500 }
    );
  }
}

