import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { ProductImage as ImageData } from '../../types/product';

interface ProductImageProps {
  readonly image: ImageData | undefined;
  readonly productName: string;
  readonly eager?: boolean;
}

export function ProductImage({
  image,
  productName,
  eager = false,
}: ProductImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!image || !image.src || failedSource === image.src) {
    return (
      <div
        role="img"
        aria-label={`Imagem indisponível de ${productName}`}
        className="flex aspect-5/4 w-full flex-col items-center justify-center gap-3 bg-soft text-muted"
      >
        <ImageOff size={28} aria-hidden="true" />
        <span className="text-sm">Imagem indisponível</span>
      </div>
    );
  }
  return (
    <img
      src={image.src}
      alt={image.alt}
      width="500"
      height="400"
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailedSource(image.src)}
      className="aspect-5/4 w-full object-cover"
    />
  );
}
