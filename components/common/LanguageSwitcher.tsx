'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
      <button
        onClick={() => changeLanguage('zh')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          lang === 'zh'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          lang === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        English
      </button>
    </div>
  );
}

