import { Grid2X2 } from 'lucide-react';
import type { Category } from '../../types/category';

interface CategoryFiltersProps {
  readonly categories: readonly Category[];
  readonly selectedId: string | null;
  readonly onChange: (id: string | null) => void;
}

export function CategoryFilters({
  categories,
  selectedId,
  onChange,
}: CategoryFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por categoria"
      className="flex flex-wrap gap-2"
    >
      <button
        type="button"
        className="category-button"
        aria-pressed={selectedId === null}
        onClick={() => onChange(null)}
      >
        <Grid2X2 size={15} aria-hidden="true" /> Todas as criações
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className="category-button"
          aria-pressed={selectedId === category.id}
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
