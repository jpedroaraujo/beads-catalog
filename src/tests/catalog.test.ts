import { describe, expect, it } from 'vitest';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { validateCatalog } from '../lib/catalog';

describe('cadastro local', () => {
  it('aceita os demonstrativos e catálogo vazio', () => {
    expect(() => validateCatalog(products, categories)).not.toThrow();
    expect(() => validateCatalog([], categories)).not.toThrow();
  });
  it('rejeita identificadores e slugs duplicados', () => {
    expect(() =>
      validateCatalog([products[0], products[0]], categories),
    ).toThrow('duplicado');
  });
  it('rejeita categorias duplicadas ou inexistentes', () => {
    expect(() => validateCatalog([], [categories[0], categories[0]])).toThrow(
      'duplicado',
    );
    expect(() =>
      validateCatalog([{ ...products[0], categoryId: 'ausente' }], categories),
    ).toThrow('Categoria inexistente');
  });
  it('identifica o produto com preço inválido', () => {
    expect(() =>
      validateCatalog(
        [{ ...products[0], pricing: { type: 'fixed', amountInCents: -1 } }],
        categories,
      ),
    ).toThrow(`Preço inválido no produto ${products[0].name}`);
  });
  it('rejeita dimensões não positivas', () => {
    expect(() =>
      validateCatalog(
        [{ ...products[0], dimensions: { width: 0, height: 5, unit: 'cm' } }],
        categories,
      ),
    ).toThrow('Dimensões inválidas');
  });
});
