import { Heart } from 'lucide-react';
import { store } from '../../config/store';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line py-7">
      <div className="page-container flex flex-col justify-between gap-4 text-xs text-muted sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg font-semibold text-ink">
            {store.name}
          </p>
          <p className="mt-1">{store.description}</p>
        </div>
        <p className="flex items-center gap-2">
          Feito à mão. Pensado com{' '}
          <Heart size={13} className="text-terracotta" aria-label="carinho" />.
        </p>
        {store.demonstrationMode && (
          <p>Catálogo demonstrativo · conteúdo fictício</p>
        )}
      </div>
    </footer>
  );
}
