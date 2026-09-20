import React, { useState, useEffect, useCallback } from 'react'
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/categories.types'
import { categoriesApi } from '../api/categories.api'
import { CategoryTable } from '../components/CategoryTable'
import { CreateCategoryModal } from '../components/CreateCategoryModal'
import { EditCategoryModal } from '../components/EditCategoryModal'
import { DeactivateCategoryDialog } from '../components/DeactivateCategoryDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag, Search, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react'

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(true)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deactivatingCategory, setDeactivatingCategory] =
    useState<Category | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setFetchError(null)
      const data = await categoriesApi.getCategories({
        includeInactive: showInactive,
      })
      setCategories(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFetchError(err.message)
      } else {
        setFetchError('Não foi possível carregar a lista de categorias.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [showInactive])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreateCategory = async (payload: CreateCategoryPayload) => {
    const newCategory = await categoriesApi.createCategory(payload)
    setCategories((prev) => [newCategory, ...prev])
  }

  const handleUpdateCategory = async (
    id: string,
    payload: UpdateCategoryPayload
  ) => {
    const updated = await categoriesApi.updateCategory(id, payload)
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  const handleDeactivateCategory = async (id: string) => {
    await categoriesApi.deactivateCategory(id)
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: false } : c))
    )
  }

  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description &&
        c.description.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gerenciamento de Categorias
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre, edite e controle a disponibilidade de categorias para os chamados.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Tag className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Fetch Error Alert */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCategories}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          variant={showInactive ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setShowInactive((prev) => !prev)}
          className="flex items-center gap-2 w-full sm:w-auto self-start sm:self-auto"
        >
          {showInactive ? (
            <>
              <Eye className="w-4 h-4 text-emerald-500" />
              Exibindo Inativas (Clique para ocultar)
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-muted-foreground" />
              Exibir Categorias Inativas
            </>
          )}
        </Button>
      </div>

      {/* Table */}
      <CategoryTable
        categories={filteredCategories}
        isLoading={isLoading}
        onEdit={(categoryToEdit) => setEditingCategory(categoryToEdit)}
        onDeactivate={(categoryToDeactivate) =>
          setDeactivatingCategory(categoryToDeactivate)
        }
      />

      {/* Modals */}
      <CreateCategoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateCategory}
      />

      <EditCategoryModal
        isOpen={Boolean(editingCategory)}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdateCategory}
      />

      <DeactivateCategoryDialog
        isOpen={Boolean(deactivatingCategory)}
        category={deactivatingCategory}
        onClose={() => setDeactivatingCategory(null)}
        onConfirm={handleDeactivateCategory}
      />
    </div>
  )
}
