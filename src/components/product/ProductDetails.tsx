import { useEffect, useRef, useState } from 'react';
import { Check, Ruler, Sparkles, X } from 'lucide-react';
import type { Product } from '../../types/product';
import { store } from '../../config/store';
import { formatProductPrice } from '../../lib/pricing';
import { buildWhatsAppOrderUrl } from '../../lib/whatsapp';
import { ProductImage } from './ProductImage';
import { WhatsAppButton } from '../ui/WhatsAppButton';

interface ProductDetailsProps {
  readonly product: Product;
  readonly categoryName: string;
  readonly onClose: () => void;
}

export function ProductDetails({
  product,
  categoryName,
  onClose,
}: ProductDetailsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const url = buildWhatsAppOrderUrl(product);
  const dimensions = product.dimensions;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="product-title"
      aria-describedby="product-description"
      className="product-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-paper">
        <button
          ref={closeRef}
          type="button"
          aria-label="Fechar detalhes"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line bg-paper shadow-sm"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <div className="grid md:grid-cols-2">
          <div className="bg-soft">
            <ProductImage
              image={product.images[imageIndex]}
              productName={product.name}
              eager
            />
            {product.images.length > 1 && (
              <div
                role="group"
                aria-label="Imagens do produto"
                className="flex flex-wrap gap-2 p-4"
              >
                {product.images.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    aria-label={`Ver imagem ${index + 1}`}
                    aria-pressed={index === imageIndex}
                    className="category-button"
                    onClick={() => setImageIndex(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
            {store.demonstrationMode && (
              <p className="p-4 text-center text-xs text-muted">
                Ilustração e produto demonstrativos
              </p>
            )}
          </div>
          <div className="p-6 md:p-8 md:pt-16">
            <p className="eyebrow">{categoryName}</p>
            <h2
              id="product-title"
              className="mt-3 font-display text-3xl font-semibold tracking-tight"
            >
              {product.name}
            </h2>
            <p className="mt-4 text-xl font-semibold text-sage">
              {formatProductPrice(product.pricing)}
            </p>
            {product.pricing.type === 'starting_at' && (
              <p className="mt-2 text-xs leading-5 text-muted">
                O valor final varia conforme tamanho, cores e personalização.
              </p>
            )}
            {product.pricing.type === 'quote' && (
              <p className="mt-2 text-xs leading-5 text-muted">
                Vamos combinar os detalhes e preparar um orçamento no
                atendimento.
              </p>
            )}
            <p
              id="product-description"
              className="mt-5 text-sm leading-7 text-muted"
            >
              {product.description}
            </p>
            <ul className="my-6 space-y-3 border-y border-line py-5 text-sm">
              <li className="flex gap-2">
                <Ruler
                  size={17}
                  className="shrink-0 text-sage"
                  aria-hidden="true"
                />
                <span>
                  {dimensions
                    ? `${dimensions.width} × ${dimensions.height}${dimensions.depth === undefined ? '' : ` × ${dimensions.depth}`} ${dimensions.unit} (aproximadamente)`
                    : 'Dimensões a combinar no atendimento'}
                </span>
              </li>
              <li className="flex gap-2">
                <Sparkles
                  size={17}
                  className="shrink-0 text-sage"
                  aria-hidden="true"
                />
                <span>
                  {product.customizable
                    ? 'Personalização de cores e detalhes disponível'
                    : 'Sem personalização para este modelo'}
                </span>
              </li>
              <li className="flex gap-2">
                <Check
                  size={17}
                  className="shrink-0 text-sage"
                  aria-hidden="true"
                />
                <span>
                  {product.available
                    ? 'Disponível para encomenda'
                    : 'Temporariamente indisponível'}
                </span>
              </li>
            </ul>
            <WhatsAppButton
              url={url}
              unavailableLabel={
                product.available ? 'Contato indisponível' : 'Peça indisponível'
              }
              className="w-full"
            />
            <p className="mt-3 text-xs leading-5 text-muted">
              {!product.available
                ? 'Esta peça não está recebendo encomendas no momento.'
                : !url
                  ? 'O WhatsApp da loja ainda não foi configurado. O contato estará disponível em breve.'
                  : 'Você continuará no WhatsApp para combinar detalhes e prazo. Nenhuma mensagem será enviada automaticamente.'}
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
}
