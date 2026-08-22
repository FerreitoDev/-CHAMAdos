// Singleton em memória para compartilhar o access token com os interceptors do axios.
// O axios não tem acesso ao contexto React, então este módulo serve de ponte
// sem criar acoplamento circular entre o client HTTP e o AuthProvider.

let token: string | null = null
let onTokenExpired: (() => void) | null = null

export const tokenStore = {
    get: (): string | null => token,
    set: (t: string): void => {
        token = t
    },
    clear: (): void => {
        token = null
    },
    // Registra callback chamado quando o refresh falha (sessão expirada)
    onExpired: (fn: () => void): void => {
        onTokenExpired = fn
    },
    triggerExpired: (): void => {
        onTokenExpired?.()
    },
}
