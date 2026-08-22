import { apiClient } from './client'

export interface LoginDto {
    email: string
    password: string
}

export interface AuthTokens {
    accessToken: string
}

export const authApi = {
    login(dto: LoginDto): Promise<AuthTokens> {
        return apiClient.post<AuthTokens>('/auth/login', dto).then((res) => res.data)
    },

    refresh(): Promise<AuthTokens> {
        return apiClient.post<AuthTokens>('/auth/refresh').then((res) => res.data)
    },

    logout(): Promise<void> {
        return apiClient.post('/auth/logout').then(() => undefined)
    },
}
