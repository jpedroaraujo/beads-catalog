import { ArrowUpRight } from 'lucide-react';
import type { Product } from '../../types/product';
import { store } from '../../config/store';
import { formatProductPrice } from '../../lib/pricing';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  readonly product: Product;
  readonly categoryName: string;
  readonly onSelect: (product: Product) => void;
}

export function ProductCard({
  product,
  categoryName,
  onSelect,
}: ProductCardProps) {
  return (
    <article className="product-card overflow-hidden rounded-2xl border border-line bg-white">
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="group block h-full w-full cursor-pointer text-left"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <div className="relative overflow-hidden">
          <ProductImage image={product.images[0]} productName={product.name} />
          <span className="absolute top-3 left-3 rounded-full border border-white/70 bg-paper/95 px-3 py-1.5 text-[10px] font-semibold tracking-wide">
            {categoryName}
          </span>
          {!product.available && (
            <span className="absolute right-3 bottom-3 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white">
              Indisponível
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl font-semibold tracking-tight">
            {product.name}
          </h3>
          <p className="mt-2 min-h-6 text-sm font-semibold text-sage">
            {formatProductPrice(product.pricing)}
          </p>
          <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
            <span className="text-xs text-muted">
              {product.customizable
                ? 'Pode ficar do seu jeito'
                : 'Detalhes da criação'}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soft text-sage transition-colors group-hover:bg-sage group-hover:text-white">
              <ArrowUpRight size={17} aria-hidden="true" />
            </span>
          </div>
          {store.demonstrationMode && (
            <p className="mt-2 text-[10px] text-muted">
              Peça e preço demonstrativos
            </p>
          )}
        </div>
      </button>
    </article>
  );
}
