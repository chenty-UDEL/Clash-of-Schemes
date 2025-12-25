// 日志消息翻译工具
// 由于服务端无法访问玩家的语言设置，日志消息可能以英文或中文存储
// 此工具用于在客户端显示时根据玩家语言设置进行翻译

import { t, tWithParams, getLanguage, type Language } from './index';

/**
 * 翻译日志消息
 * 尝试识别日志消息中的翻译键或英文内容，并转换为玩家当前语言
 */
export function translateLogMessage(
  message: string,
  playerId?: number | null
): string {
  const lang = getLanguage(playerId);
  
  // 如果已经是中文，且玩家选择中文，直接返回
  if (lang === 'zh' && !message.match(/^[A-Za-z]/)) {
    return message;
  }
  
  // 如果玩家选择中文，但消息是英文，尝试翻译
  if (lang === 'zh') {
    // 匹配常见的英文日志消息并翻译
    const translations: Record<string, string> = {
      'Copy successful! You have gained player': '复制成功！你已获得玩家',
      'Day breaks. It was a peaceful night.': '天亮了，昨晚风平浪静。',
      'Day breaks.': '天亮了。',
      'players were silenced last night.': '名玩家被禁言。',
      'You have gained player': '你已获得玩家',
      's role': '的角色',
      'skills. If that player dies, you die too.': '技能。如果该玩家死亡，你也会死亡。',
      'Alliance formed! You have allied with player': '同盟已形成！你已与玩家',
      'Target locked! You have selected player': '目标已锁定！你已选择玩家',
      'as your shadow target.': '作为你的影子目标。',
      'Fate transferred! You have swapped fates with player': '命运已转移！你与玩家',
      'Your fate has been swapped with player': '你的命运已与玩家',
      '调换。': '调换。',
      'Prediction recorded: You have predicted': '预测已记录：你预测',
      'Victory steal locked! You have locked player': '胜利夺取已锁定！你已锁定玩家',
      'No votes today.': '今天无人投票。',
      'Tie!': '平票！',
      'all received': '都获得了',
      'votes. No elimination.': '票。无人出局。',
      'Player': '玩家',
      'was voted out.': '被投票出局。',
      'died because the copied target died.': '因复制的目标死亡而死亡。',
      'Prediction successful! Consecutive': '预测成功！连续',
      'times.': '次。',
      'Prediction failed, streak reset.': '预测失败，连续次数重置。',
      'Game over!': '游戏结束！',
      'Game over.': '游戏结束。',
      'No winner.': '无获胜者。',
      'Deadlock! The same situation occurred 3 times in a row. Game over.': '⚠️ 死局！连续3次出现相同情况，游戏结束。',
      'Game over (deadlock)': '游戏结束（死局）',
    };
    
    // 尝试直接匹配
    for (const [en, zh] of Object.entries(translations)) {
      if (message.includes(en)) {
        return message.replace(en, zh);
      }
    }
    
    // 尝试匹配带参数的消息
    const copySuccessMatch = message.match(/Copy successful! You have gained player 【(.+?)】's role 【(.+?)】 skills\. If that player dies, you die too\./);
    if (copySuccessMatch) {
      return tWithParams('gameLog.copySuccess', { name: copySuccessMatch[1], role: copySuccessMatch[2] }, lang);
    }
    
    const nightEndSilenceMatch = message.match(/Day breaks\. (\d+) players were silenced last night\./);
    if (nightEndSilenceMatch) {
      return tWithParams('gameLog.nightEndWithSilence', { count: parseInt(nightEndSilenceMatch[1]) }, lang);
    }
    
    if (message === 'Day breaks. It was a peaceful night.') {
      return t('gameLog.nightEndPeaceful', lang);
    }
    
    // 匹配平票消息：Tie! {names} all received {votes} votes. No elimination.
    const tieVoteMatch = message.match(/Tie! (.+?) all received (\d+) votes?\. No elimination\./);
    if (tieVoteMatch) {
      return tWithParams('gameLog.tieVote', { names: tieVoteMatch[1], votes: parseInt(tieVoteMatch[2]) }, lang);
    }
    
    // 匹配未翻译的翻译键（如 "gameLog.gameStarted"）
    if (message.startsWith('gameLog.')) {
      // 尝试直接翻译
      const translated = t(message as any, lang);
      if (translated !== message) {
        return translated;
      }
    }
  }
  
  // 如果玩家选择英文，但消息是中文，尝试翻译为英文
  if (lang === 'en') {
    // 匹配中文平票消息
    const tieVoteZhMatch = message.match(/平票！【(.+?)】都获得了 (\d+) 票。无人出局。/);
    if (tieVoteZhMatch) {
      return tWithParams('gameLog.tieVote', { names: tieVoteZhMatch[1], votes: parseInt(tieVoteZhMatch[2]) }, lang);
    }
    
    // 匹配未翻译的翻译键
    if (message.startsWith('gameLog.')) {
      const translated = t(message as any, lang);
      if (translated !== message) {
        return translated;
      }
    }
  }
  
  // 如果无法翻译，返回原消息
  return message;
}

