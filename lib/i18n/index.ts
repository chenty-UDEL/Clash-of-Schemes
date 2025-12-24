// 国际化配置和工具函数
import { zh } from './locales/zh';
import { en } from './locales/en';

export type Language = 'zh' | 'en';
export type TranslationKey = string;

// 翻译资源
const translations = {
  zh,
  en
};

// 获取嵌套对象的属性值
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // 如果找不到，返回原始键
    }
  }
  
  return typeof value === 'string' ? value : path;
}

// 翻译函数
export function t(key: TranslationKey, lang: Language = 'zh'): string {
  const translation = translations[lang];
  if (!translation) {
    return key;
  }
  
  return getNestedValue(translation, key);
}

// 带参数的翻译函数
export function tWithParams(
  key: TranslationKey,
  params: Record<string, string | number>,
  lang: Language = 'zh'
): string {
  let text = t(key, lang);
  
  // 替换参数
  Object.entries(params).forEach(([paramKey, paramValue]) => {
    text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
  });
  
  return text;
}

// 获取语言设置（从 localStorage）
export function getLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'zh'; // 服务端默认中文
  }
  
  const saved = localStorage.getItem('language') as Language;
  return saved && (saved === 'zh' || saved === 'en') ? saved : 'zh';
}

// 设置语言
export function setLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}

// 导出翻译资源类型（用于类型检查）
export type Translations = typeof zh;

