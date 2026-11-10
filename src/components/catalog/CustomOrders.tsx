import { ArrowRight, Lightbulb, Palette, Sparkles } from 'lucide-react';
import { buildWhatsAppCustomOrderUrl } from '../../lib/whatsapp';
import { WhatsAppButton } from '../ui/WhatsAppButton';

export function CustomOrders() {
  const url = buildWhatsAppCustomOrderUrl();
  return (
    <section
      id="personalizadas"
      aria-labelledby="custom-title"
      className="scroll-mt-6 rounded-3xl border border-[#dce1d4] bg-soft px-6 py-10 sm:px-10 md:flex md:items-center md:justify-between md:gap-12 md:py-12"
    >
      <div className="max-w-xl">
        <p className="eyebrow mb-4 flex items-center gap-2">
          <Sparkles size={15} aria-hidden="true" /> UM POUQUINHO DE VOCÊ
        </p>
        <h2
          id="custom-title"
          className="font-display text-3xl leading-tight font-medium tracking-tight sm:text-4xl"
        >
          Sua ideia também pode virar beads.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Uma referência especial, suas cores favoritas ou uma ideia que ainda
          está no papel. Vamos descobrir as possibilidades juntos?
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium text-sage">
          <span className="flex items-center gap-2">
            <Lightbulb size={15} aria-hidden="true" /> Você imagina
          </span>
          <ArrowRight size={14} aria-hidden="true" />
          <span className="flex items-center gap-2">
            <Palette size={15} aria-hidden="true" /> A gente combina os detalhes
          </span>
        </div>
      </div>
      <div className="mt-8 max-w-xs shrink-0 md:mt-0">
        <WhatsAppButton url={url} label="Quero uma arte personalizada" />
        <p className="mt-3 text-xs leading-5 text-muted">
          {url
            ? 'Orçamento e prazo combinados no atendimento.'
            : 'O WhatsApp da loja ainda não foi configurado. Em breve, vamos conversar por lá.'}
        </p>
      </div>
    </section>
  );
}
