import { ArrowDown, Heart, Palette, Sparkles } from 'lucide-react';
import { store } from '../../config/store';

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="page-container grid items-center gap-4 pb-12 pt-12 md:grid-cols-2 md:pb-16 md:pt-14"
    >
      <div className="relative z-10 max-w-xl">
        <p className="eyebrow mb-6 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-terracotta" /> FEITO À MÃO,
          BEAD POR BEAD
        </p>
        <h1
          id="hero-title"
          className="font-display text-[clamp(2.8rem,5.6vw,4.65rem)] leading-[1.07] font-medium tracking-[-0.045em]"
        >
          Pequenas peças,
          <br />
          grandes <span className="text-sage">sorrisos.</span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-muted">
          Um universo de cores em Hama Beads. Encontre uma criação que combine
          com você ou imagine algo só seu.
        </p>
        <a href="#catalogo" className="button-primary mt-8">
          Explorar as criações <ArrowDown size={17} aria-hidden="true" />
        </a>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-muted">
          <span className="flex items-center gap-2">
            <Heart size={15} aria-hidden="true" /> Feito com carinho
          </span>
          <span className="flex items-center gap-2">
            <Palette size={15} aria-hidden="true" /> Cores e possibilidades
          </span>
        </div>
      </div>
      <figure className="relative mx-auto w-full max-w-xl">
        <img
          src="/images/hero-beads.svg"
          width="720"
          height="600"
          alt="Ilustração de flores e morangos em beads sobre uma placa de montagem"
          className="h-auto w-full"
          fetchPriority="high"
        />
        <div className="absolute right-0 bottom-[18%] flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3 shadow-sm sm:right-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lilac">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <span className="text-xs leading-5">
            Um pouquinho de cor.
            <br />
            <strong className="font-semibold">Um montão de afeto.</strong>
          </span>
        </div>
        <figcaption className="text-center text-[11px] text-muted">
          {store.demonstrationMode
            ? 'Ilustração demonstrativa · identidade visual provisória'
            : 'Ilustração de Hama Beads'}
        </figcaption>
      </figure>
    </section>
  );
}
