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

    // 计算票数
    const voteCounts: Record<number, number> = {};
    players.forEach(p => voteCounts[p.id] = 0);

    votes.forEach(v => {
      if (!v.target_id) return;
      const voter = players.find(p => p.id === v.voter_id);
      if (!voter || !voter.is_alive) return;
      let weight = (voter.role === '双票使者') ? 2 : 1;
      voteCounts[v.target_id] += weight;
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

