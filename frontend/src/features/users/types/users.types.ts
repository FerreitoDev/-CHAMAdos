import { UserRole } from '@/features/auth/auth.types'

export type { UserRole }

export interface SafeUser {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface UpdateUserPayload {
  name?: string
  role?: UserRole
}
