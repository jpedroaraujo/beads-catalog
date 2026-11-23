import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AdminProduct, ProductInput } from '../../types/admin-catalog';
import type { Category } from '../../types/category';
import type { ProductPricing } from '../../types/product';
import { parseProductInput } from '../../lib/admin-catalog';

interface ProductEditorProps {
  readonly product: AdminProduct | null;
  readonly categories: readonly Category[];
  readonly busy: boolean;
  readonly onSave: (product: ProductInput) => void;
  readonly onCancel: () => void;
}

const inputClass = 'w-full rounded-md border border-line bg-paper p-2';
const labelClass = 'grid gap-1 text-sm font-medium';

function parsePrice(value: FormDataEntryValue | null): number {
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(String(value ?? '').trim());
  if (!match)
    throw new Error('Informe o valor em reais, com até duas casas decimais.');
  const cents = Number(`${match[1]}${(match[2] ?? '').padEnd(2, '0')}`);
  if (!Number.isSafeInteger(cents))
    throw new Error('O valor do produto é muito alto.');
  return cents;
}

function formatInputPrice(pricing: ProductPricing | undefined): string {
  if (!pricing || pricing.type === 'quote') return '';
  const cents = String(pricing.amountInCents).padStart(3, '0');
  return `${cents.slice(0, -2)},${cents.slice(-2)}`;
}

function slugFromName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ProductEditor({
  product,
  categories,
  busy,
  onSave,
  onCancel,
}: ProductEditorProps) {
  const [pricingType, setPricingType] = useState(
    product?.pricing.type ?? 'fixed',
  );
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get('name') ?? '');
    const width = fields.get('width');
    const height = fields.get('height');
    const depth = fields.get('depth');
    try {
      const data = parseProductInput({
        name,
        slug: String(fields.get('slug') ?? '').trim() || slugFromName(name),
        description: fields.get('description'),
        categoryId: fields.get('categoryId'),
        pricing:
          pricingType === 'quote'
            ? { type: 'quote' }
            : {
                type: pricingType,
                amountInCents: parsePrice(fields.get('price')),
              },
        ...(width || height || depth
          ? {
              dimensions: {
                unit: 'cm',
                width: Number(width),
                height: Number(height),
                ...(depth ? { depth: Number(depth) } : {}),
              },
            }
          : {}),
        available: fields.has('available'),
        customizable: fields.has('customizable'),
        visible: fields.has('visible'),
      });
      onSave(data);
    } catch (issue) {
      setError(
        issue instanceof Error ? issue.message : 'Revise os dados do produto.',
      );
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-line bg-paper p-4 sm:p-6"
      aria-labelledby="product-form-title"
    >
      <h2 id="product-form-title" className="font-display text-2xl">
        {product ? 'Editar produto' : 'Novo produto'}
      </h2>
      <fieldset disabled={busy} className="mt-4 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Nome
            <input
              className={inputClass}
              name="name"
              defaultValue={product?.name}
              required
            />
          </label>
          <label className={labelClass}>
            Slug{' '}
            <span className="font-normal text-muted">
              Gerado pelo nome se ficar vazio.
            </span>
            <input
              className={inputClass}
              name="slug"
              defaultValue={product?.slug}
            />
          </label>
        </div>
        <label className={labelClass}>
          Descrição
          <textarea
            className={inputClass}
            name="description"
            rows={3}
            defaultValue={product?.description}
            required
          />
        </label>
        <label className={labelClass}>
          Categoria
          <select
            className={inputClass}
            name="categoryId"
            defaultValue={product?.categoryId ?? ''}
            required
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Modalidade de preço
            <select
              className={inputClass}
              value={pricingType}
              onChange={({ target }) => {
                const value = target.value;
                if (
                  value === 'fixed' ||
                  value === 'starting_at' ||
                  value === 'quote'
                )
                  setPricingType(value);
              }}
            >
              <option value="fixed">Preço fixo</option>
              <option value="starting_at">A partir de</option>
              <option value="quote">Sob consulta</option>
            </select>
          </label>
          <label className={pricingType === 'quote' ? 'hidden' : labelClass}>
            Valor em reais
            <input
              className={inputClass}
              name="price"
              inputMode="decimal"
              defaultValue={formatInputPrice(product?.pricing)}
              required={pricingType !== 'quote'}
              disabled={pricingType === 'quote'}
            />
          </label>
        </div>
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-2 text-sm font-medium">
            Dimensões opcionais em cm
          </legend>
          <label className={labelClass}>
            Largura
            <input
              className={inputClass}
              name="width"
              type="number"
              step="any"
              defaultValue={product?.dimensions?.width}
            />
          </label>
          <label className={labelClass}>
            Altura
            <input
              className={inputClass}
              name="height"
              type="number"
              step="any"
              defaultValue={product?.dimensions?.height}
            />
          </label>
          <label className={labelClass}>
            Profundidade
            <input
              className={inputClass}
              name="depth"
              type="number"
              step="any"
              defaultValue={product?.dimensions?.depth}
            />
          </label>
        </fieldset>
        <fieldset className="grid gap-2 sm:grid-cols-3">
          <legend className="mb-2 text-sm font-medium">
            Exibição e encomenda
          </legend>
          <label className="flex min-h-10 items-center gap-2">
            <input
              type="checkbox"
              name="visible"
              defaultChecked={product?.visible ?? false}
            />{' '}
            Visível no catálogo
          </label>
          <label className="flex min-h-10 items-center gap-2">
            <input
              type="checkbox"
              name="available"
              defaultChecked={product?.available ?? true}
            />{' '}
            Aceita encomenda
          </label>
          <label className="flex min-h-10 items-center gap-2">
            <input
              type="checkbox"
              name="customizable"
              defaultChecked={product?.customizable ?? false}
            />{' '}
            Personalizável
          </label>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="button-secondary">
            {busy ? 'Salvando…' : 'Salvar produto'}
          </button>
          <button type="button" className="button-secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </fieldset>
    </form>
  );
}
