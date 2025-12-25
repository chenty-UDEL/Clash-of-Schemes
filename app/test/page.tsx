'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_ROLES, BOARDS, type BoardType } from '@/lib/game/roles';
import { getRoleName, getRoleTag, getRoleDescription } from '@/lib/game/roleTranslations';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

export default function TestModePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [playerName, setPlayerName] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedBoard, setSelectedBoard] = useState<BoardType>('custom');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartTest = async () => {
    if (!playerName.trim()) {
      setError(t('error.enterName'));
      return;
    }

    if (!selectedRole) {
      setError('请选择一个角色进行测试');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/test/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          selectedRole,
          boardType: selectedBoard
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || '创建测试房间失败');
      }

      // 跳转到游戏页面，并传递房间号
      router.push(`/?room=${result.data.roomCode}&test=true`);
    } catch (err: any) {
      setError(err.message || '创建测试房间失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="max-w-6xl mx-auto pt-8">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-block mb-4 text-blue-400 hover:text-blue-300 transition"
        >
          ← {t('common.back') || '返回主页'}
        </Link>

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
            🧪 {t('testMode.title') || '测试模式'}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('testMode.description') || '选择角色进行单机测试，AI会自动创建其他玩家并辅助测试'}
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：玩家信息设置 */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                {t('testMode.playerInfo') || '玩家信息'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    {t('game.nickname') || '昵称'}
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder={t('game.enterName') || '请输入名字'}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    {t('testMode.selectBoard') || '选择板子'}
                  </label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value as BoardType)}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                  >
                    <option value="custom">{t('gameManual.customBoard') || '自定义'}</option>
                    <option value="fate">{t('gameManual.boardFate') || '命运之轮'}</option>
                    <option value="balance">{t('gameManual.boardBalance') || '均衡法则'}</option>
                    <option value="strategy">{t('gameManual.boardStrategy') || '策略之巅'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 开始测试按钮 */}
            <button
              onClick={handleStartTest}
              disabled={loading || !playerName.trim() || !selectedRole}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-lg font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (t('common.loading') || '创建中...') : (t('testMode.startTest') || '🚀 开始测试')}
            </button>
          </div>

          {/* 右侧：角色选择 */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                {t('testMode.selectRole') || '选择要测试的角色'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                {ALL_ROLES.map((role) => {
                  const isSelected = selectedRole === role;
                  
                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-900/20'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-white">{getRoleName(role)}</h3>
                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                          {getRoleTag(role)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{getRoleDescription(role)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 说明信息 */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg">
          <h3 className="text-blue-400 font-bold mb-2">ℹ️ {t('testMode.info') || '测试说明'}</h3>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>{t('testMode.info1') || '测试模式会自动创建6-8个AI玩家'}</li>
            <li>{t('testMode.info2') || 'AI玩家会自动进行夜晚行动和白天投票'}</li>
            <li>{t('testMode.info3') || '你可以随时手动结算夜晚或白天阶段'}</li>
            <li>{t('testMode.info4') || '测试房间以TEST开头，方便识别'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

