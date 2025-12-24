'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLanguage, setLanguage, t, tWithParams, type Language } from '@/lib/i18n';

export function useTranslation() {
  const [lang, setLangState] = useState<Language>(getLanguage);

  // 监听语言变化
  useEffect(() => {
    const handleStorageChange = () => {
      setLangState(getLanguage());
    };

    // 监听 localStorage 变化
    window.addEventListener('storage', handleStorageChange);
    
    // 定期检查（处理同窗口内的变化）
    const interval = setInterval(() => {
      const currentLang = getLanguage();
      if (currentLang !== lang) {
        setLangState(currentLang);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [lang]);

  // 切换语言
  const changeLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang);
    setLangState(newLang);
    // 触发页面重新渲染
    window.dispatchEvent(new Event('languagechange'));
  }, []);

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

