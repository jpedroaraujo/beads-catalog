import { describe, expect, it } from 'vitest';
import type { ProductPricing } from '../types/product';
import { formatProductPrice, isProductPricing } from '../lib/pricing';

describe('formatProductPrice', () => {
  it.each<[ProductPricing, string]>([
    [{ type: 'fixed', amountInCents: 1500 }, 'R$\u00a015,00'],
    [{ type: 'starting_at', amountInCents: 2000 }, 'A partir de R$\u00a020,00'],
    [{ type: 'quote' }, 'Sob consulta'],
    [{ type: 'fixed', amountInCents: 0 }, 'R$\u00a00,00'],
    [{ type: 'starting_at', amountInCents: 0 }, 'A partir de R$\u00a00,00'],
    [{ type: 'fixed', amountInCents: 1599 }, 'R$\u00a015,99'],
    [{ type: 'starting_at', amountInCents: 2001 }, 'A partir de R$\u00a020,01'],
    [{ type: 'fixed', amountInCents: 1 }, 'R$\u00a00,01'],
  ])('formata %j como %s', (pricing, expected) => {
    expect(formatProductPrice(pricing)).toBe(expected);
    expect(isProductPricing(pricing)).toBe(true);
  });

  const invalid: unknown[] = [
    null,
    undefined,
    '',
    1500,
    {},
    { type: 'subscription' },
    { type: 'fixed' },
    { type: 'starting_at' },
    { type: 'quote', amountInCents: 0 },
    { type: 'quote', amountInCents: undefined },
    ...['fixed', 'starting_at'].flatMap((type) =>
      [
        -1,
        1.5,
        NaN,
        Infinity,
        -Infinity,
        Number.MAX_SAFE_INTEGER + 1,
        '1500',
        null,
      ].map((amountInCents) => ({ type, amountInCents })),
    ),
  ];

  it.each(invalid.map((value, index) => ({ value, index })))(
    'rejeita entrada inválida $index',
    ({ value }) => {
      expect(isProductPricing(value)).toBe(false);
      // Simula uma fronteira de dados sem tipagem; nunca fazer cast assim no cadastro.
      expect(() => formatProductPrice(value as ProductPricing)).toThrow(
        RangeError,
      );
    },
  );
});
