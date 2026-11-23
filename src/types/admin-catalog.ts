import type { Category } from './category';
import type { Product, ProductImage } from './product';

export interface AdminCategory extends Category {
  readonly revision: number;
}

export interface AdminImage extends ProductImage {
  readonly position: number;
}

export interface AdminProduct extends Product {
  readonly images: readonly AdminImage[];
  readonly revision: number;
  readonly visible: boolean;
}

export interface AdminCatalog {
  readonly categories: readonly AdminCategory[];
  readonly products: readonly AdminProduct[];
}

export type CategoryInput = Omit<Category, 'id'>;
export type ProductInput = Omit<AdminProduct, 'id' | 'images' | 'revision'>;
