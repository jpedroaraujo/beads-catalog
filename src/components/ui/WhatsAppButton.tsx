import { ArrowUpRight, MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  readonly url: string | null;
  readonly label?: string;
  readonly unavailableLabel?: string;
  readonly className?: string;
}

export function WhatsAppButton({
  url,
  label = 'Encomendar pelo WhatsApp',
  unavailableLabel = 'Contato indisponível',
  className = '',
}: WhatsAppButtonProps) {
  const content = (
    <>
      <MessageCircle size={19} aria-hidden="true" />
      <span>{url ? label : unavailableLabel}</span>
      {url && <ArrowUpRight size={17} aria-hidden="true" />}
    </>
  );
  const styles = `button-primary ${className}`;
  return url ? (
    <a className={styles} href={url} target="_blank" rel="noopener noreferrer">
      {content}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  ) : (
    <button type="button" className={styles} disabled>
      {content}
    </button>
  );
}
