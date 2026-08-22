import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { authApi } from '@/shared/api/auth.api'
import { tokenStore } from '@/shared/api/token-store'
import type { AuthContextValue, AuthUser, LoginDto } from './auth.types'

// Decodifica o payload de um JWT sem validar assinatura (seguro pois o token
// é validado pelo backend a cada requisição protegida)
function decodeJwtPayload(token: string): AuthUser {
    let base64Payload = token.split('.')[1]
    // Converte Base64Url para Base64 padrão
    base64Payload = base64Payload.replace(/-/g, '+').replace(/_/g, '/')

    // Adiciona padding se faltar
    const pad = base64Payload.length % 4
    if (pad) {
        base64Payload += '='.repeat(4 - pad)
    }

    const decoded = JSON.parse(atob(base64Payload)) as {
        sub: string
        email: string
        role: string
    }
    return {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role as AuthUser['role'],
    }
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Tenta recuperar a sessão ao montar via refresh token no cookie.
    // Usuários com sessão ativa não precisam fazer login novamente.
    useEffect(() => {
        authApi
            .refresh()
            .then(({ accessToken: token }) => {
                tokenStore.set(token)
                setAccessToken(token)
                setUser(decodeJwtPayload(token))
            })
            .catch(() => {
                // Sem sessão válida — estado inicial já é null, não há ação necessária
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [])

    // Escuta evento de sessão expirada emitido silenciosamente pelo client axios
    useEffect(() => {
        tokenStore.onExpired(() => {
            setAccessToken(null)
            setUser(null)
        })
    }, [])

    const login = useCallback(async (dto: LoginDto) => {
        const { accessToken: token } = await authApi.login(dto)
        tokenStore.set(token)
        setAccessToken(token)
        setUser(decodeJwtPayload(token))
    }, [])

    const logout = useCallback(async () => {
        await authApi.logout()
        tokenStore.clear()
        setAccessToken(null)
        setUser(null)
    }, [])

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            accessToken,
            isAuthenticated: user !== null,
            isLoading,
            login,
            logout,
        }),
        [user, accessToken, isLoading, login, logout],
    )

    return <AuthContext value={value}>{children}</AuthContext>
}
