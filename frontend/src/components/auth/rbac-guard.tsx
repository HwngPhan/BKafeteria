'use client'

import { useAuth } from '@/providers/AuthProvider'
import { ReactNode } from 'react'

type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER'

interface RBACGuardProps {
  children: ReactNode
  allowedRoles: Role[]
  fallback?: ReactNode
}

export function RBACGuard({ children, allowedRoles, fallback = null }: RBACGuardProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return fallback
  }

  if (!allowedRoles.includes(user.role as Role)) {
    return fallback
  }

  return <>{children}</>
}

/**
 * Hook version of RBAC check
 */
export function useHasRole(roles: Role[]) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated || !user) return false
  return roles.includes(user.role as Role)
}
