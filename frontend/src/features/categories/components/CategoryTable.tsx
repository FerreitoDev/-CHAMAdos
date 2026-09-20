import React from 'react'
import type { Category } from '../types/categories.types'
import { CategoryStatusBadge } from './CategoryStatusBadge'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Tag } from 'lucide-react'

interface CategoryTableProps {
  categories: Category[]
  isLoading?: boolean
  onEdit?: (category: Category) => void
  onDeactivate?: (category: Category) => void
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  isLoading = false,
  onEdit,
  onDeactivate,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground animate-pulse">
        Carregando lista de categorias...
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
        <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
        Nenhuma categoria encontrada.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
          <tr>
            <th scope="col" className="px-6 py-3 font-semibold">
              Categoria
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Descrição
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Data de Cadastro
            </th>
            <th scope="col" className="px-6 py-3 font-semibold text-right">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categories.map((category) => {
            const isInactive = !category.active

            return (
              <tr
                key={category.id}
                className="hover:bg-muted/30 transition-colors"
                data-testid={`category-row-${category.id}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    {category.name}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs truncate text-xs text-muted-foreground">
                  {category.description || 'Sem descrição'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CategoryStatusBadge active={category.active} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(category.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(category)}
                      title="Editar categoria"
                      aria-label={`Editar ${category.name}`}
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isInactive}
                      onClick={() => onDeactivate?.(category)}
                      title={
                        isInactive
                          ? 'Categoria já está inativa'
                          : 'Desativar categoria'
                      }
                      aria-label={`Desativar ${category.name}`}
                    >
                      <Trash2
                        className={`w-4 h-4 ${
                          !isInactive
                            ? 'text-destructive hover:text-destructive/80'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
