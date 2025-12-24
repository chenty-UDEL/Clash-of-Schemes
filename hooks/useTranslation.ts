'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLanguage, setLanguage, t, tWithParams, type Language } from '@/lib/i18n';

interface UseTranslationOptions {
  playerId?: number | null;
}

export function useTranslation(options?: UseTranslationOptions) {
  const { playerId } = options || {};
  const [lang, setLangState] = useState<Language>(() => getLanguage(playerId));

  // 监听语言变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 检查是否是当前玩家的语言设置变化
      if (playerId && e.key === `language_${playerId}`) {
        setLangState(getLanguage(playerId));
      } else if (!playerId && e.key === 'language') {
        setLangState(getLanguage());
      }
    };

    // 监听 sessionStorage 变化（跨标签页）
    window.addEventListener('storage', handleStorageChange);
    
    // 定期检查（处理同窗口内的变化）
    const interval = setInterval(() => {
      const currentLang = getLanguage(playerId);
      if (currentLang !== lang) {
        setLangState(currentLang);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [lang, playerId]);

  // 切换语言
  const changeLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang, playerId);
    setLangState(newLang);
    // 触发页面重新渲染
    window.dispatchEvent(new Event('languagechange'));
  }, [playerId]);

  // 翻译函数
  const translate = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      if (params) {
        return tWithParams(key, params, lang);
      }
      return t(key, lang);
    },
    [lang]
  );

  return {
    t: translate,
    lang,
    changeLanguage,
    isZh: lang === 'zh',
    isEn: lang === 'en'
  };
}

