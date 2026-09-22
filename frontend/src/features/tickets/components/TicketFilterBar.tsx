import React, { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { TicketPriority, TicketStatus } from '../types/tickets.types'
import type { Category } from '@/features/categories/types/categories.types'
import { categoriesApi } from '@/features/categories/api/categories.api'

interface TicketFilterBarProps {
  search?: string
  status?: TicketStatus
  priority?: TicketPriority
  categoryId?: string
  categories?: Category[]
  onFilterChange: (filters: {
    search?: string
    status?: TicketStatus
    priority?: TicketPriority
    categoryId?: string
  }) => void
  onClearFilters: () => void
}

export const TicketFilterBar: React.FC<TicketFilterBarProps> = ({
  search = '',
  status,
  priority,
  categoryId,
  categories: categoriesProp,
  onFilterChange,
  onClearFilters,
}) => {
  const [categories, setCategories] = useState<Category[]>(categoriesProp || [])

  useEffect(() => {
    if (!categoriesProp) {
      categoriesApi.getCategories().then(setCategories).catch(() => {})
    } else {
      setCategories(categoriesProp)
    }
  }, [categoriesProp])

  const hasActiveFilters = Boolean(search || status || priority || categoryId)

  const selectClassName =
    'h-9 rounded-md border border-input bg-card px-3 py-1 text-sm text-foreground shadow-2xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
      <div className="flex-1 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={search}
            onChange={(e) =>
              onFilterChange({
                search: e.target.value,
                status,
                priority,
                categoryId,
              })
            }
            className="pl-9 text-sm h-9"
          />
        </div>

        {/* Status Select */}
        <select
          value={status || ''}
          onChange={(e) =>
            onFilterChange({
              search,
              status: (e.target.value as TicketStatus) || undefined,
              priority,
              categoryId,
            })
          }
          aria-label="Filtrar por Status"
          className={selectClassName}
        >
          <option value="">Todos os Status</option>
          <option value="OPEN">Aberto</option>
          <option value="IN_PROGRESS">Em Atendimento</option>
          <option value="RESOLVED">Resolvido</option>
          <option value="CLOSED">Encerrado</option>
        </select>

        {/* Priority Select */}
        <select
          value={priority || ''}
          onChange={(e) =>
            onFilterChange({
              search,
              status,
              priority: (e.target.value as TicketPriority) || undefined,
              categoryId,
            })
          }
          aria-label="Filtrar por Prioridade"
          className={selectClassName}
        >
          <option value="">Todas as Prioridades</option>
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="URGENT">Urgente</option>
        </select>

        {/* Category Select */}
        <select
          value={categoryId || ''}
          onChange={(e) =>
            onFilterChange({
              search,
              status,
              priority,
              categoryId: e.target.value || undefined,
            })
          }
          aria-label="Filtrar por Categoria"
          className={selectClassName}
        >
          <option value="">Todas as Categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 self-end lg:self-center shrink-0"
        >
          <X className="size-3.5" />
          Limpar Filtros
        </Button>
      )}
    </div>
  )
}
