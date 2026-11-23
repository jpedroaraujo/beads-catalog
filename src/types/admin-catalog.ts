import type { Category } from './category';
import type { Product } from './product';

export interface AdminCategory extends Category {
  readonly revision: number;
}

export interface AdminProduct extends Product {
  readonly revision: number;
  readonly visible: boolean;
}

export interface AdminCatalog {
  readonly categories: readonly AdminCategory[];
  readonly products: readonly AdminProduct[];
}

export type CategoryInput = Omit<Category, 'id'>;
export type ProductInput = Omit<AdminProduct, 'id' | 'images' | 'revision'>;
