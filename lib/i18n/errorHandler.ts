// 错误消息处理工具
import { t, tWithParams, getLanguage } from './index';

/**
 * 将后端返回的错误键转换为用户友好的错误消息
 */
export function translateError(
  errorKey: string, 
  errorParams?: Record<string, string | number>,
  playerId?: number | null
): string {
  // 如果已经是翻译后的文本（不包含点号），直接返回
  if (!errorKey || !errorKey.includes('.')) {
    return errorKey || 'Unknown error';
  }

  // 尝试翻译错误消息（使用玩家特定的语言）
  const lang = getLanguage(playerId);
  
  try {
    if (errorParams) {
      return tWithParams(errorKey, errorParams, lang);
    }
    
    return t(errorKey, lang);
  } catch (err) {
    // 如果翻译失败，返回原始键
    return errorKey;
  }
}

/**
 * 处理API响应中的错误消息
 */
export function handleApiError(response: { error?: string; errorParams?: Record<string, string | number> }): string {
  if (!response.error) {
    return translateError('error.serverError');
  }

  return translateError(response.error, response.errorParams);
}

