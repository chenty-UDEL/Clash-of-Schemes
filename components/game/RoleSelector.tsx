'use client';

import { useState } from 'react';
import { ALL_ROLES, getRoleConfig } from '@/lib/game/roles';
import { getRoleName, getRoleTag, getRoleDescription } from '@/lib/game/roleTranslations';
import { useTranslation } from '@/hooks/useTranslation';
import type { RoleName } from '@/lib/game/roles';

interface RoleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string | null;
  playerId: number;
  roomCode: string;
  onRoleChange: () => void;
}

export default function RoleSelector({
  isOpen,
  onClose,
  currentRole,
  playerId,
  roomCode,
  onRoleChange
}: RoleSelectorProps) {
  const { t } = useTranslation({ playerId });
  const [selectedRole, setSelectedRole] = useState<RoleName | ''>(currentRole as RoleName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSetRole = async () => {
    if (!selectedRole) {
      setError('请选择一个角色');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/players/${playerId}/set-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          roomCode
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || '设置角色失败');
      }

      onRoleChange();
      onClose();
    } catch (err: any) {
      setError(err.message || '设置角色失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-yellow-400">🎭 {t('gameUI.selectRole')} ({t('gameUI.testingMode')})</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">{t('gameUI.currentRole')}: {currentRole ? getRoleName(currentRole as RoleName) : t('gameUI.unassigned')}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-400 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg font-bold"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSetRole}
            disabled={loading || !selectedRole}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white p-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('common.loading') : t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

