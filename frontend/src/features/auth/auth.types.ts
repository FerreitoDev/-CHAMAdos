export type UserRole = 'USER' | 'TECHNICIAN' | 'ADMIN'

export interface AuthUser {
    id: string
    email: string
    role: UserRole
}

export interface LoginDto {
    email: string
    password: string
}

export interface AuthContextValue {
    user: AuthUser | null
    accessToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (dto: LoginDto) => Promise<void>
    logout: () => Promise<void>
}
