import { useState } from 'react';
import type { Catalog } from '../types/catalog';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CategoryFilters } from '../components/catalog/CategoryFilters';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { CustomOrders } from '../components/catalog/CustomOrders';
import { ProductDetails } from '../components/product/ProductDetails';

type CatalogPageProps =
  | {
      readonly state: 'ready';
      readonly catalog: Catalog;
      readonly demonstration?: boolean;
    }
  | { readonly state: 'loading'; readonly demonstration?: boolean }
  | {
      readonly state: 'error';
      readonly onRetry: () => void;
      readonly demonstration?: boolean;
    };

export function CatalogPage(props: CatalogPageProps) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const catalog = props.state === 'ready' ? props.catalog : null;
  const selectedCategoryId = catalog?.categories.some(
    ({ id }) => id === categoryId,
  )
    ? categoryId
    : null;
  const filtered = selectedCategoryId
    ? catalog?.products.filter(
        (product) => product.categoryId === selectedCategoryId,
      )
    : catalog?.products;
  const selectedProduct = catalog?.products.find(
    ({ id }) => id === selectedProductId,
  );

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
              {filtered && (
                <p
                  aria-live="polite"
                  aria-atomic="true"
                  className="text-xs text-muted"
                >
                  {filtered.length}{' '}
                  {filtered.length === 1 ? 'criação' : 'criações'}
                </p>
              )}
            </div>
            {props.demonstration && (
              <p className="mb-6 rounded-lg border border-line bg-paper p-3 text-sm text-muted">
                Catálogo demonstrativo. Peças, preços e imagens são exemplos.
              </p>
            )}
            {props.state === 'loading' && (
              <p role="status" className="text-sm text-muted">
                Carregando as criações…
              </p>
            )}
            {props.state === 'error' && (
              <div className="rounded-lg border border-line bg-paper p-4">
                <p role="alert">Não foi possível carregar o catálogo.</p>
                <button
                  type="button"
                  className="button-secondary mt-4"
                  onClick={props.onRetry}
                >
                  Tentar novamente
                </button>
              </div>
            )}
            {catalog && filtered && (
              <>
                <div className="mb-7">
                  <CategoryFilters
                    categories={catalog.categories}
                    selectedId={selectedCategoryId}
                    onChange={setCategoryId}
                  />
                </div>
                <ProductGrid
                  products={filtered}
                  categories={catalog.categories}
                  onSelect={(product) => setSelectedProductId(product.id)}
                  onReset={() => setCategoryId(null)}
                  filtered={selectedCategoryId !== null}
                />
              </>
            )}
          </section>
          <CustomOrders />
        </div>
      </main>
      <Footer />
      {catalog && selectedProduct && (
        <ProductDetails
          key={selectedProduct.id}
          product={selectedProduct}
          categoryName={
            catalog.categories.find(
              (category) => category.id === selectedProduct.categoryId,
            )?.name ?? 'Criação artesanal'
          }
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </>
  );
}
