import { use } from 'react'
import { AuthContext } from './auth.context'
import type { AuthContextValue } from './auth.types'

export function useAuth(): AuthContextValue {
    const context = use(AuthContext)
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return context
}
