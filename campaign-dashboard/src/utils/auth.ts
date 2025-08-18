import bcrypt from 'bcryptjs'
import { UserRole, CampaignRole } from '@prisma/client'

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function hasPermission(userRole: UserRole | CampaignRole, requiredRole: UserRole | CampaignRole): boolean {
  const roleHierarchy = {
    [UserRole.VOLUNTEER]: 0,
    [UserRole.CAMPAIGN_MANAGER]: 1,
    [UserRole.ADMIN]: 2,
    [CampaignRole.VOLUNTEER]: 0,
    [CampaignRole.MANAGER]: 1,
    [CampaignRole.ADMIN]: 2,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function canManageCampaign(userRole: UserRole, campaignRole?: CampaignRole): boolean {
  if (userRole === UserRole.ADMIN) return true
  if (campaignRole && (campaignRole === CampaignRole.ADMIN || campaignRole === CampaignRole.MANAGER)) return true
  return false
}

export function canManageVolunteers(userRole: UserRole, campaignRole?: CampaignRole): boolean {
  return canManageCampaign(userRole, campaignRole)
}

export function canCreateEvents(userRole: UserRole, campaignRole?: CampaignRole): boolean {
  return canManageCampaign(userRole, campaignRole)
}

export function canAssignTasks(userRole: UserRole, campaignRole?: CampaignRole): boolean {
  return canManageCampaign(userRole, campaignRole)
}