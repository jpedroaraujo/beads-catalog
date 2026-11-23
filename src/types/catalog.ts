import type { Category } from './category';
import type { Product } from './product';

export interface Catalog {
  readonly categories: readonly Category[];
  readonly products: readonly Product[];
}
