import { Flower2 } from 'lucide-react';
import type { Category } from '../../types/category';
import type { Product } from '../../types/product';
import { ProductCard } from '../product/ProductCard';

interface ProductGridProps {
  readonly products: readonly Product[];
  readonly categories: readonly Category[];
  readonly onSelect: (product: Product) => void;
  readonly onReset: () => void;
  readonly filtered: boolean;
}

export function ProductGrid({
  products,
  categories,
  onSelect,
  onReset,
  filtered,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-paper px-6 py-16 text-center">
        <Flower2
          className="mx-auto mb-4 text-sage"
          size={32}
          aria-hidden="true"
        />
        <h3 className="font-display text-2xl">
          Novas criações vão florescer por aqui.
        </h3>
        <p className="mt-3 text-sm text-muted">
          {filtered
            ? 'Ainda não há peças nesta categoria. Que tal explorar as outras?'
            : 'Ainda não há peças no catálogo. Volte em breve para conhecer as novidades.'}
        </p>
        {filtered && (
          <button
            type="button"
            className="button-secondary mt-6"
            onClick={onReset}
          >
            Ver todas as criações
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={
            categories.find((category) => category.id === product.categoryId)
              ?.name ?? 'Criação artesanal'
          }
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
