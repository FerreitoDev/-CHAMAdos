import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { login, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/'

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true })
        }
    }, [isAuthenticated, navigate, from])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return

        setError(null)
        setIsSubmitting(true)

        try {
            await login({ email, password })
            navigate(from, { replace: true })
        } catch {
            setError('Credenciais inválidas')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight text-primary">CHAMAdos</CardTitle>
                    <CardDescription>Insira suas credenciais para acessar o sistema</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && <div className="text-sm font-medium text-destructive text-center">{error}</div>}
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting || !email || !password}>
                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
