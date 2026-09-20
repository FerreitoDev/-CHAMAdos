import React, { useState, useEffect } from 'react'
import type { Category, UpdateCategoryPayload } from '../types/categories.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Edit2, AlertCircle, Loader2 } from 'lucide-react'

interface EditCategoryModalProps {
  isOpen: boolean
  category: Category | null
  onClose: () => void
  onSubmit: (id: string, payload: UpdateCategoryPayload) => Promise<void>
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  category,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)

  const [nameError, setNameError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && category) {
      setName(category.name)
      setDescription(category.description || '')
      setActive(category.active)
      setNameError(null)
      setApiError(null)
      setIsSubmitting(false)
    }
  }, [isOpen, category])

  if (!isOpen || !category) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!name.trim()) {
      setNameError('Nome da categoria é obrigatório')
      return
    }
    setNameError(null)

    try {
      setIsSubmitting(true)
      await onSubmit(category.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        active,
      })
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError('Erro ao atualizar categoria. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="edit-category-modal"
    >
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Edit2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              Editar Categoria
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
            <Label htmlFor="edit-category-name">Nome da Categoria</Label>
            <Input
              id="edit-category-name"
              placeholder="Ex: Hardware"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-category-description">Descrição (Opcional)</Label>
            <Input
              id="edit-category-description"
              placeholder="Ex: Relacionado a periféricos e peças físicas"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-category-status">Status</Label>
            <select
              id="edit-category-status"
              value={active ? 'true' : 'false'}
              onChange={(e) => setActive(e.target.value === 'true')}
              disabled={isSubmitting}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
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
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
