import { store } from '../../config/store';
import { buildWhatsAppCustomOrderUrl } from '../../lib/whatsapp';
import { WhatsAppButton } from '../ui/WhatsAppButton';

export function Header() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="page-container flex min-h-24 flex-wrap items-center justify-between gap-4 py-4">
        <a
          href="#inicio"
          className="flex items-center gap-3 rounded-lg"
          aria-label={`${store.name}, início`}
        >
          <img src={store.logoSrc} width="44" height="44" alt="" />
          <span>
            <span className="block font-display text-xl font-semibold tracking-tight">
              {store.name}
            </span>
            <span className="mt-0.5 block text-[10px] font-bold tracking-[0.16em] text-muted">
              CATÁLOGO ARTESANAL{store.demonstrationMode ? ' · DEMO' : ''}
            </span>
          </span>
        </a>
        <nav
          aria-label="Navegação principal"
          className="order-3 flex w-full justify-center gap-7 border-t border-line pt-4 text-sm font-medium sm:order-none sm:w-auto sm:border-0 sm:pt-0"
        >
          <a className="nav-link" href="#catalogo">
            As criações
          </a>
          <a className="nav-link" href="#personalizadas">
            Do seu jeito
          </a>
          <a className="nav-link" href="#como-funciona">
            Como encomendar
          </a>
        </nav>
        <div className="hidden lg:block">
          <WhatsAppButton
            url={buildWhatsAppCustomOrderUrl()}
            label="Vamos conversar"
            unavailableLabel="Contato em breve"
          />
        </div>
      </div>
    </header>
  );
}
