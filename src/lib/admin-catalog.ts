import type {
  AdminCatalog,
  AdminCategory,
  AdminImage,
  AdminProduct,
  CategoryInput,
  ProductInput,
} from '../types/admin-catalog';
import type { Category } from '../types/category';
import type { Product, ProductImage } from '../types/product';
import {
  isNonemptyText,
  isProductDimensions,
  isRecord,
  parseCatalog,
} from './catalog';
import { isProductPricing } from './pricing';

export function isRevision(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;
}

function hasRevision<T extends Category | Product>(
  entry: T,
): entry is T & { readonly revision: number } {
  return 'revision' in entry && isRevision(entry.revision);
}

export function isImagePosition(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isAdminImage(image: ProductImage): image is AdminImage {
  return 'position' in image && isImagePosition(image.position);
}

export function parseAdminCatalog(value: unknown): AdminCatalog {
  const { categories, products } = parseCatalog(value);
  if (
    !categories.every((entry): entry is AdminCategory => hasRevision(entry)) ||
    !products.every(
      (entry): entry is AdminProduct =>
        hasRevision(entry) &&
        'visible' in entry &&
        typeof entry.visible === 'boolean' &&
        entry.images.every(isAdminImage),
    )
  )
    throw new Error('Resposta inválida da administração.');
  return { categories, products };
}

export function parseCategoryInput(value: unknown): CategoryInput {
  if (
    !isRecord(value) ||
    !isNonemptyText(value.name) ||
    ('description' in value && typeof value.description !== 'string')
  ) {
    throw new Error('Informe o nome da categoria e revise a descrição.');
  }
  return {
    name: value.name.trim(),
    ...(typeof value.description === 'string' && value.description.trim()
      ? { description: value.description.trim() }
      : {}),
  };
}

export function parseProductInput(value: unknown): ProductInput {
  if (!isRecord(value)) throw new Error('Revise os dados do produto.');
  const {
    name,
    slug,
    description,
    categoryId,
    pricing,
    dimensions,
    available,
    customizable,
    visible,
  } = value;
  if (
    !isNonemptyText(name) ||
    !isNonemptyText(description) ||
    !isNonemptyText(categoryId)
  ) {
    throw new Error('Preencha nome, descrição e categoria.');
  }
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      'Use apenas letras minúsculas, números e hífens entre palavras no slug.',
    );
  }
  if (!isProductPricing(pricing)) {
    throw new Error('Informe um preço válido para a modalidade selecionada.');
  }
  if ('dimensions' in value && !isProductDimensions(dimensions)) {
    throw new Error(
      'Informe largura e altura positivas em cm. A profundidade é opcional.',
    );
  }
  if (
    typeof available !== 'boolean' ||
    typeof customizable !== 'boolean' ||
    typeof visible !== 'boolean'
  ) {
    throw new Error(
      'Revise os estados de visibilidade, disponibilidade e personalização.',
    );
  }
  return {
    name: name.trim(),
    slug,
    description: description.trim(),
    categoryId,
    pricing,
    ...(isProductDimensions(dimensions) ? { dimensions } : {}),
    available,
    customizable,
    visible,
  };
}
