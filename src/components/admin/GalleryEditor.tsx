import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { AdminImage, AdminProduct } from '../../types/admin-catalog';
import {
  imageAccept,
  maxImageAltLength,
  maxImageBytes,
  maxImageSizeMB,
  maxProductImages,
  normalizeImageAlt,
} from '../../lib/image-upload';
import { ProductImage } from '../product/ProductImage';

interface GalleryEditorProps {
  readonly product: AdminProduct;
  readonly busy: boolean;
  readonly onChange: (
    suffix: string,
    request: RequestInit,
    message: string,
  ) => void;
  readonly onClose: () => void;
}

function jsonRequest(method: string, data: object): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

export function GalleryEditor({
  product,
  busy,
  onChange,
  onClose,
}: GalleryEditorProps) {
  const [draft, setDraft] = useState<{
    readonly image: AdminImage | 'new';
    readonly revision: number;
  } | null>(null);
  const [error, setError] = useState('');
  const closeButton = useRef<HTMLButtonElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { images, revision } = product;
  const selected = draft?.revision === revision ? draft.image : null;
  const currentImage = selected && selected !== 'new' ? selected : null;

  useEffect(() => {
    if (selected) fileInput.current?.focus();
    else if (draft) closeButton.current?.focus();
  }, [draft, selected]);

  function select(image: AdminImage | 'new' | null) {
    setDraft(image ? { image, revision } : null);
    setError('');
    if (!image) closeButton.current?.focus();
  }

  function move(index: number, step: -1 | 1) {
    const positions = images.map(({ position }) => position);
    const [position] = positions.splice(index, 1);
    if (position === undefined) return;
    positions.splice(index + step, 0, position);
    onChange(
      '/order',
      jsonRequest('PUT', { positions, revision }),
      'Ordem das fotos atualizada.',
    );
  }

  function remove(image: AdminImage) {
    if (!window.confirm(`Remover a foto “${image.alt}”?`)) return;
    onChange(
      `/${image.position}`,
      jsonRequest('DELETE', { revision }),
      'Foto removida.',
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const fields = new FormData(event.currentTarget);
    const alt = normalizeImageAlt(fields.get('alt'));
    const file = fields.get('photo');
    if (!alt) {
      setError('Informe um texto alternativo de até 200 caracteres.');
      return;
    }
    if (!(file instanceof File) || file.size === 0) {
      if (currentImage) {
        onChange(
          `/${currentImage.position}`,
          jsonRequest('PATCH', { alt, revision }),
          'Texto alternativo atualizado.',
        );
      } else {
        setError('Selecione uma foto para enviar.');
      }
      return;
    }
    if (file.size > maxImageBytes) {
      setError(`A foto deve ter até ${maxImageSizeMB} MB.`);
      return;
    }
    if (file.type && !imageAccept.split(',').includes(file.type)) {
      setError('Envie uma imagem JPEG, PNG ou WebP.');
      return;
    }
    onChange(
      currentImage ? `/${currentImage.position}` : '',
      {
        method: currentImage ? 'PUT' : 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'X-Catalog-Revision': String(revision),
          'X-Image-Alt': encodeURIComponent(alt),
        },
        body: file,
      },
      currentImage ? 'Foto substituída.' : 'Foto adicionada.',
    );
  }

  return (
    <section
      className="grid gap-4 rounded-xl border border-line bg-paper p-4 sm:p-6"
      aria-labelledby="gallery-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="gallery-title" className="font-display text-2xl">
          Fotos de {product.name}
        </h2>
        <button
          ref={closeButton}
          type="button"
          className="button-secondary"
          onClick={onClose}
        >
          Fechar galeria
        </button>
      </div>
      <p className="text-sm text-muted">
        {images.length} de {maxProductImages} fotos. A primeira aparece na
        vitrine.
      </p>
      {images.length === 0 && (
        <p className="text-sm">Nenhuma foto cadastrada.</p>
      )}
      <ol className="grid gap-3">
        {images.map((image, index) => (
          <li
            key={image.position}
            className="grid gap-3 rounded-lg border border-line p-3 sm:grid-cols-[7rem_1fr]"
          >
            <div className="w-28 overflow-hidden rounded-md">
              <ProductImage image={image} productName={product.name} />
            </div>
            <div className="grid gap-2">
              <p className="text-sm">
                <span className="font-semibold">
                  {index === 0 ? 'Capa' : `Foto ${index + 1}`}
                </span>{' '}
                · {image.alt}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="button-secondary"
                  aria-label={`Subir foto ${index + 1}`}
                  disabled={busy || !!selected || index === 0}
                  onClick={() => move(index, -1)}
                >
                  Subir
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  aria-label={`Descer foto ${index + 1}`}
                  disabled={busy || !!selected || index === images.length - 1}
                  onClick={() => move(index, 1)}
                >
                  Descer
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  aria-label={`Editar foto ${index + 1}`}
                  disabled={busy || !!selected}
                  onClick={() => select(image)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  aria-label={`Remover foto ${index + 1}`}
                  disabled={busy || !!selected}
                  onClick={() => remove(image)}
                >
                  Remover
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {!selected && (
        <button
          type="button"
          className="button-secondary w-fit"
          disabled={busy || images.length >= maxProductImages}
          onClick={() => select('new')}
        >
          Adicionar foto
        </button>
      )}
      {selected && (
        <form
          className="rounded-lg border border-line p-3"
          onSubmit={submit}
          aria-labelledby="photo-form-title"
        >
          <h3 id="photo-form-title" className="font-semibold">
            {currentImage ? 'Editar foto' : 'Adicionar foto'}
          </h3>
          <fieldset className="mt-3 grid gap-3" disabled={busy}>
            <label className="grid gap-1 text-sm font-medium">
              {currentImage
                ? 'Arquivo para substituir a foto (opcional)'
                : 'Arquivo da foto'}
              <input
                ref={fileInput}
                type="file"
                name="photo"
                className="max-w-full rounded-md border border-line p-2"
                accept={imageAccept}
                required={!currentImage}
              />
              <span className="font-normal text-muted">
                JPEG, PNG ou WebP de até {maxImageSizeMB} MB.
              </span>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Texto alternativo
              <input
                name="alt"
                className="rounded-md border border-line bg-paper p-2"
                required
                maxLength={maxImageAltLength}
                defaultValue={currentImage?.alt}
              />
            </label>
            {error && (
              <p className="text-sm" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="button-secondary">
                {busy ? 'Salvando…' : 'Salvar foto'}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => select(null)}
              >
                Cancelar
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  );
}
