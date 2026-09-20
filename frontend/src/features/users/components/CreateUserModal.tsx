import React, { useState, useEffect } from 'react'
import type { CreateUserPayload, UserRole } from '../types/users.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, UserPlus, AlertCircle, Loader2 } from 'lucide-react'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateUserPayload) => Promise<void>
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('USER')

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
  }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setEmail('')
      setPassword('')
      setRole('USER')
      setErrors({})
      setApiError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Insira um e-mail válido'
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 8) {
      newErrors.password = 'A senha deve ter no mínimo 8 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validate()) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      })
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError('Erro ao criar usuário. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="create-user-modal"
    >
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              Cadastrar Novo Usuário
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
            aria-label="Fechar"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Ex: João da Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="joao@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha Inicial</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Papel / Nível de Acesso</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isSubmitting}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="USER">Usuário (Solicitante)</option>
              <option value="TECHNICIAN">Técnico (Atendimento)</option>
              <option value="ADMIN">Administrador (Gestão)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar Usuário'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
