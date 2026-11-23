import { products as catalogProducts } from '../data/products';
import { categories } from '../data/categories';
import type { Product } from '../types/product';
import { CatalogPage } from './CatalogPage';

interface AppProps {
  readonly products?: readonly Product[];
}

export function App({ products = catalogProducts }: AppProps) {
  return <CatalogPage state="ready" catalog={{ products, categories }} />;
}
