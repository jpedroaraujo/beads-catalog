import type { Category } from '../types/category';
import type { Product } from '../types/product';
import { isProductPricing } from './pricing';

// Validação pequena do cadastro local; não é uma camada de persistência.
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
      const { width, height, depth } = product.dimensions;
      if (
        [width, height, ...(depth === undefined ? [] : [depth])].some(
          (dimension) => !Number.isFinite(dimension) || dimension <= 0,
        )
      ) {
        throw new Error(`Dimensões inválidas no produto ${product.name}.`);
      }
    }
    ids.add(product.id);
    slugs.add(product.slug);
  }
}
