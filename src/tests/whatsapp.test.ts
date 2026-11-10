import { describe, expect, it } from 'vitest';
import { products } from '../data/products';
import {
  buildWhatsAppCustomOrderUrl,
  buildWhatsAppOrderUrl,
  isWhatsAppNumberConfigured,
} from '../lib/whatsapp';

// Token numérico exclusivo do teste estrutural, não é um telefone comercial.
const testNumber = '12345678';
const baseProduct = products[0];

describe('WhatsApp', () => {
  it('começa sem configuração e não gera links', () => {
    expect(buildWhatsAppOrderUrl(baseProduct)).toBeNull();
    expect(buildWhatsAppCustomOrderUrl()).toBeNull();
  });

  it.each([
    '',
    '+12345678',
    '123 45678',
    '123-45678',
    '012345678',
    '1234567',
    '1234567890123456',
    'abcdefgh',
    ' 12345678',
  ])('bloqueia número inválido %j', (number) => {
    expect(isWhatsAppNumberConfigured(number)).toBe(false);
    expect(buildWhatsAppOrderUrl(baseProduct, number)).toBeNull();
    expect(buildWhatsAppCustomOrderUrl(number)).toBeNull();
  });

  it.each(products.filter((product) => product.available))(
    'gera pedido independentemente do preço: $name',
    (product) => {
      const url = buildWhatsAppOrderUrl(product, testNumber);
      expect(url).not.toBeNull();
      const parsed = new URL(url!);
      expect(parsed.origin).toBe('https://wa.me');
      expect(parsed.pathname).toBe(`/${testNumber}`);
      expect(parsed.searchParams.get('text')).toBe(
        `Olá! Vi a arte ${product.name} no catálogo e gostaria de fazer uma encomenda. Poderia me informar os detalhes e o prazo de produção?`,
      );
    },
  );

  it('codifica acentos e caracteres especiais sem criar parâmetros extras', () => {
    const product = { ...baseProduct, name: 'Flor & coração / #1?' };
    const url = buildWhatsAppOrderUrl(product, testNumber)!;
    expect(url).toContain(encodeURIComponent(product.name));
    expect([...new URL(url).searchParams.keys()]).toEqual(['text']);
    expect(new URL(url).hash).toBe('');
  });

  it('gera mensagem específica para personalização sem produto', () => {
    const url = buildWhatsAppCustomOrderUrl(testNumber)!;
    expect(new URL(url).searchParams.get('text')).toContain(
      'referência, o tamanho, as cores',
    );
    expect(url).toContain(encodeURIComponent('Olá!'));
  });

  it('impede pedido de peça indisponível mesmo com número configurado', () => {
    expect(
      buildWhatsAppOrderUrl({ ...baseProduct, available: false }, testNumber),
    ).toBeNull();
  });
});
