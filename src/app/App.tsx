import { useState } from 'react';
import { products as catalogProducts } from '../data/products';
import { categories } from '../data/categories';
import type { Product } from '../types/product';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CategoryFilters } from '../components/catalog/CategoryFilters';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { CustomOrders } from '../components/catalog/CustomOrders';
import { ProductDetails } from '../components/product/ProductDetails';

interface AppProps {
  readonly products?: readonly Product[];
}

export function App({ products = catalogProducts }: AppProps) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const filtered = categoryId
    ? products.filter((product) => product.categoryId === categoryId)
    : products;

  return (
    <>
      <a href="#catalogo" className="skip-link">
        Pular para as criações
      </a>
      <div id="inicio">
        <Header />
      </div>
      <main id="conteudo">
        <div className="page-container pt-8 sm:pt-12">
          <section
            id="catalogo"
            aria-labelledby="catalog-title"
            className="scroll-mt-6 pb-14"
          >
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">CORES QUE GANHAM FORMA</p>
                <h1
                  id="catalog-title"
                  className="font-display text-3xl font-medium tracking-tight sm:text-4xl"
                >
                  Encontre seu próximo encanto.
                </h1>
                <p className="mt-3 text-sm text-muted">
                  Pequenos detalhes para presentear, decorar ou levar com você.
                </p>
              </div>
              <p
                aria-live="polite"
                aria-atomic="true"
                className="text-xs text-muted"
              >
                {filtered.length}{' '}
                {filtered.length === 1 ? 'criação' : 'criações'}
              </p>
            </div>
            <div className="mb-7">
              <CategoryFilters
                categories={categories}
                selectedId={categoryId}
                onChange={setCategoryId}
              />
            </div>
            <ProductGrid
              products={filtered}
              categories={categories}
              onSelect={setSelectedProduct}
              onReset={() => setCategoryId(null)}
              filtered={categoryId !== null}
            />
          </section>
          <CustomOrders />
        </div>
      </main>
      <Footer />
      {selectedProduct && (
        <ProductDetails
          key={selectedProduct.id}
          product={selectedProduct}
          categoryName={
            categories.find(
              (category) => category.id === selectedProduct.categoryId,
            )?.name ?? 'Criação artesanal'
          }
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
