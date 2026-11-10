import type { ProductPricing } from '../types/product';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function isProductPricing(value: unknown): value is ProductPricing {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }
  if (value.type === 'quote') return !('amountInCents' in value);
  if (value.type !== 'fixed' && value.type !== 'starting_at') return false;
  return (
    'amountInCents' in value &&
    typeof value.amountInCents === 'number' &&
    Number.isSafeInteger(value.amountInCents) &&
    value.amountInCents >= 0
  );
}

export function formatProductPrice(pricing: ProductPricing): string {
  if (!isProductPricing(pricing)) {
    throw new RangeError(
      'Preço inválido: confira a modalidade e os centavos inteiros não negativos.',
    );
  }
  switch (pricing.type) {
    case 'fixed':
      return currency.format(pricing.amountInCents / 100);
    case 'starting_at':
      return `A partir de ${currency.format(pricing.amountInCents / 100)}`;
    case 'quote':
      return 'Sob consulta';
  }
}
