import React, { useEffect, useState } from 'react'
import type { CreateTicketPayload, TicketPriority } from '../types/tickets.types'
import type { Category } from '@/features/categories/types/categories.types'
import { categoriesApi } from '@/features/categories/api/categories.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Ticket as TicketIcon, X } from 'lucide-react'

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateTicketPayload) => Promise<void>
  categories?: Category[]
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories: categoriesProp,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM')
  const [categoryId, setCategoryId] = useState('')

  const [categories, setCategories] = useState<Category[]>(categoriesProp || [])
  const [titleError, setTitleError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setCategoryId('')
      setTitleError(null)
      setDescriptionError(null)
      setCategoryError(null)
      setApiError(null)
      setIsSubmitting(false)

      if (!categoriesProp) {
        categoriesApi
          .getCategories()
          .then((cats) => setCategories(cats.filter((c) => c.active)))
          .catch(() => {})
      } else {
        setCategories(categoriesProp.filter((c) => c.active))
      }
    }
  }, [isOpen, categoriesProp])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    let hasError = false

    if (!title.trim() || title.trim().length < 3) {
      setTitleError('O título deve ter pelo menos 3 caracteres')
      hasError = true
    } else {
      setTitleError(null)
    }

    if (!description.trim() || description.trim().length < 5) {
      setDescriptionError('A descrição deve ter pelo menos 5 caracteres')
      hasError = true
    } else {
      setDescriptionError(null)
    }

    if (!categoryId) {
      setCategoryError('Selecione uma categoria para o chamado')
      hasError = true
    } else {
      setCategoryError(null)
    }

    if (hasError) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        categoryId,
      })
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError('Erro ao abrir chamado. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="create-ticket-modal"
    >
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TicketIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Abrir Novo Chamado</h2>
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
            <Label htmlFor="ticket-title">Título do Chamado</Label>
            <Input
              id="ticket-title"
              placeholder="Ex: Monitor sem sinal de vídeo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
            {titleError && <p className="text-xs text-destructive">{titleError}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ticket-category">Categoria</Label>
              <select
                id="ticket-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categoryError && <p className="text-xs text-destructive">{categoryError}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ticket-priority">Prioridade</Label>
              <select
                id="ticket-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                disabled={isSubmitting}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticket-description">Descrição Detalhada</Label>
            <textarea
              id="ticket-description"
              rows={4}
              placeholder="Descreva o problema com o máximo de detalhes possível..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring text-foreground resize-none"
            />
            {descriptionError && <p className="text-xs text-destructive">{descriptionError}</p>}
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
                  Abrindo Chamado...
                </>
              ) : (
                'Abrir Chamado'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
