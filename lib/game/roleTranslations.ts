// 角色翻译工具函数
import { t, getLanguage } from '@/lib/i18n';
import type { RoleName } from './roles';

/**
 * 获取角色名称（根据当前语言）
 */
export function getRoleName(role: RoleName): string {
  const lang = getLanguage();
  return t(`role.names.${role}`, lang);
}

/**
 * 获取角色标签（根据当前语言）
 */
export function getRoleTag(role: RoleName): string {
  const lang = getLanguage();
  return t(`role.tags.${role}`, lang);
}

/**
 * 获取角色描述（根据当前语言）
 */
export function getRoleDescription(role: RoleName): string {
  const lang = getLanguage();
  return t(`role.descriptions.${role}`, lang);
}

/**
 * 获取角色配置（支持双语）
 */
export function getLocalizedRoleConfig(role: RoleName) {
  const { getRoleConfig } = require('./roles');
  const config = getRoleConfig(role);
  
  return {
    ...config,
    tag: getRoleTag(role),
    desc: getRoleDescription(role)
  };
}

