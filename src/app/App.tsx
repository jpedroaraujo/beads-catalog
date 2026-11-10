import { useState } from 'react';
import { Info, MessageCircle, MousePointer2, PackageCheck } from 'lucide-react';
import { products as catalogProducts } from '../data/products';
import { categories } from '../data/categories';
import { store } from '../config/store';
import type { Product } from '../types/product';
import { Header } from '../components/layout/Header';
import { Hero } from '../components/layout/Hero';
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
        <Hero />
        <div className="page-container">
          {store.demonstrationMode && (
            <aside
              aria-label="Sobre este catálogo"
              className="mb-12 flex items-start gap-3 rounded-xl border border-line bg-[#f2efe6] px-4 py-3 text-xs leading-5 text-muted"
            >
              <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                <strong className="font-semibold text-ink">
                  Um catálogo em construção.
                </strong>{' '}
                As peças, ilustrações e preços são exemplos fictícios. O nome e
                a identidade são provisórios.
              </p>
            </aside>
          )}
          <section
            id="catalogo"
            aria-labelledby="catalog-title"
            className="scroll-mt-6 pb-14"
          >
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">CORES QUE GANHAM FORMA</p>
                <h2
                  id="catalog-title"
                  className="font-display text-3xl font-medium tracking-tight sm:text-4xl"
                >
                  Encontre seu próximo encanto.
                </h2>
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
          <section
            id="como-funciona"
            aria-labelledby="how-title"
            className="scroll-mt-6 pt-16"
          >
            <p className="eyebrow text-center">DAQUI PARA O SEU DIA</p>
            <h2
              id="how-title"
              className="mt-3 text-center font-display text-3xl font-medium tracking-tight"
            >
              Encomendar é simples.
            </h2>
            <ol className="mt-9 grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: MousePointer2,
                  title: 'Escolha seu encanto',
                  text: 'Explore as peças e abra os detalhes para conhecer cada criação.',
                },
                {
                  icon: MessageCircle,
                  title: 'Vamos conversar',
                  text: 'Com o contato disponível, você combina cores, valores e prazo pelo WhatsApp.',
                },
                {
                  icon: PackageCheck,
                  title: 'Acerte os últimos detalhes',
                  text: 'Produção, pagamento e entrega são combinados diretamente com a artesã.',
                },
              ].map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soft text-sage">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="mb-1 text-[10px] font-bold tracking-widest text-muted">
                      0{index + 1}
                    </p>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
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
