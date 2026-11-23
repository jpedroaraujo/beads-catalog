import type { Catalog } from '../types/catalog';
import type { Category } from '../types/category';
import type { Product, ProductDimensions } from '../types/product';
import { isProductPricing } from './pricing';

// Validação das regras compartilhadas pelo cadastro local e pela API.
export function validateCatalog(
  products: readonly Product[],
  categories: readonly Category[],
): void {
  const categoryIds = new Set(categories.map((category) => category.id));
  if (categoryIds.size !== categories.length) {
    throw new Error('Cadastro inválido: categorias com id duplicado.');
  }
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const product of products) {
    if (
      !product.id ||
      !product.slug ||
      ids.has(product.id) ||
      slugs.has(product.slug)
    ) {
      throw new Error(
        `Cadastro inválido: id/slug ausente ou duplicado em ${product.name}.`,
      );
    }
    if (!categoryIds.has(product.categoryId)) {
      throw new Error(`Categoria inexistente no produto ${product.name}.`);
    }
    if (!isProductPricing(product.pricing)) {
      throw new Error(`Preço inválido no produto ${product.name}.`);
    }
    if (product.dimensions) {
      if (!isProductDimensions(product.dimensions)) {
        throw new Error(`Dimensões inválidas no produto ${product.name}.`);
      }
    }
    ids.add(product.id);
    slugs.add(product.slug);
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNonemptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isCategory(value: unknown): value is Category {
  return (
    isRecord(value) &&
    isNonemptyText(value.id) &&
    isNonemptyText(value.name) &&
    (!('description' in value) || typeof value.description === 'string')
  );
}

export function isProductDimensions(
  value: unknown,
): value is ProductDimensions {
  return (
    isRecord(value) &&
    isPositiveDimension(value.width) &&
    isPositiveDimension(value.height) &&
    (!('depth' in value) || isPositiveDimension(value.depth)) &&
    value.unit === 'cm'
  );
}

function isPositiveDimension(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isProduct(value: unknown): value is Product {
  return (
    isRecord(value) &&
    isNonemptyText(value.id) &&
    isNonemptyText(value.slug) &&
    isNonemptyText(value.name) &&
    isNonemptyText(value.description) &&
    isNonemptyText(value.categoryId) &&
    isProductPricing(value.pricing) &&
    typeof value.customizable === 'boolean' &&
    typeof value.available === 'boolean' &&
    Array.isArray(value.images) &&
    value.images.every(
      (image: unknown) =>
        isRecord(image) &&
        isNonemptyText(image.src) &&
        isNonemptyText(image.alt),
    ) &&
    (!('dimensions' in value) || isProductDimensions(value.dimensions))
  );
}

export function parseCatalog(value: unknown): Catalog {
  if (
    !isRecord(value) ||
    !Array.isArray(value.categories) ||
    !value.categories.every(isCategory) ||
    !Array.isArray(value.products) ||
    !value.products.every(isProduct)
  ) {
    throw new Error('Resposta inválida do catálogo.');
  }
  validateCatalog(value.products, value.categories);
  return { categories: value.categories, products: value.products };
}
