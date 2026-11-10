import { store } from '../config/store';
import type { Product } from '../types/product';

export function isWhatsAppNumberConfigured(number: string): boolean {
  return /^[1-9]\d{7,14}$/.test(number);
}

function buildWhatsAppUrl(message: string, number: string): string | null {
  if (!isWhatsAppNumberConfigured(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppOrderUrl(
  product: Product,
  number: string = store.whatsappNumber,
): string | null {
  if (!product.available) return null;
  return buildWhatsAppUrl(
    `Olá! Vi a arte ${product.name} no catálogo e gostaria de fazer uma encomenda. Poderia me informar os detalhes e o prazo de produção?`,
    number,
  );
}

export function buildWhatsAppCustomOrderUrl(
  number: string = store.whatsappNumber,
): string | null {
  return buildWhatsAppUrl(
    'Olá! Gostaria de encomendar uma arte personalizada em Hama Beads. Podemos conversar sobre a referência, o tamanho, as cores e o prazo de produção?',
    number,
  );
}
