import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../app/App';
import { products } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { ProductDetails } from '../components/product/ProductDetails';
import { ProductImage } from '../components/product/ProductImage';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';

describe('card de produto', () => {
  it.each([
    { product: products[0], expected: /R\$\s15,00/ },
    { product: products[2], expected: /A partir de R\$\s25,00/ },
    { product: products[4], expected: /^Sob consulta$/ },
  ])('apresenta o preço de $product.name', ({ product, expected }) => {
    render(
      <ProductCard
        product={product}
        categoryName="Exemplo"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText(expected)).toBeVisible();
    if (product.pricing.type === 'quote')
      expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });
});

describe('catálogo', () => {
  it('filtra categorias, apresenta vazio recuperável e restaura todas', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getAllByRole('article')).toHaveLength(6);
    await user.click(screen.getByRole('button', { name: 'Chaveiros' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Chaveiros' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.queryByRole('button', {
        name: 'Ver detalhes de Borboleta colorida',
      }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Marcadores' }));
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Ainda não há peças nesta categoria/),
    ).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'Ver todas as criações' }),
    );
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(
      screen.getByRole('button', { name: 'Todas as criações' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('trata catálogo completamente vazio', () => {
    render(<App products={[]} />);
    expect(screen.getByText(/Ainda não há peças no catálogo/)).toBeVisible();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('abre detalhes, informa contato ausente e devolve foco ao fechar', async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole('button', {
      name: 'Ver detalhes de Flor de bolso',
    });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Flor de bolso' });
    expect(within(dialog).getByText(/R\$\s15,00/)).toBeVisible();
    expect(
      within(dialog).getByRole('button', { name: 'Contato indisponível' }),
    ).toBeDisabled();
    expect(
      within(dialog).getByText(/WhatsApp da loja ainda não foi configurado/),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', { name: /Encomendar pelo WhatsApp/ }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Fechar detalhes' }),
    ).toHaveFocus();
    await user.click(
      within(dialog).getByRole('button', { name: 'Fechar detalhes' }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('fecha no evento cancel nativo (Escape no navegador)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole('button', {
        name: 'Ver detalhes de Fantasminha gentil',
      }),
    );
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Sob consulta')).toBeVisible();
    fireEvent(
      dialog,
      new Event('cancel', { bubbles: false, cancelable: true }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('identifica peça indisponível e impede encomenda', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole('button', { name: 'Ver detalhes de Margarida solar' }),
    );
    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText('Temporariamente indisponível'),
    ).toBeVisible();
    expect(
      within(dialog).getByRole('button', { name: 'Peça indisponível' }),
    ).toBeDisabled();
  });

  it('permite trocar imagens adicionais nos detalhes', async () => {
    const user = userEvent.setup();
    const images = [products[0].images[0], products[1].images[0]] as const;
    render(
      <ProductDetails
        product={{ ...products[0], images }}
        categoryName="Exemplo"
        onClose={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Ver imagem 2' }));
    expect(screen.getByRole('img', { name: images[1].alt })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Ver imagem 2' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('imagens e links', () => {
  it('mostra fallback para imagem ausente', () => {
    render(<ProductImage image={undefined} productName="Exemplo" />);
    expect(
      screen.getByRole('img', { name: 'Imagem indisponível de Exemplo' }),
    ).toBeVisible();
  });
  it('mostra fallback para falha de carregamento', () => {
    render(
      <ProductImage image={products[0].images[0]} productName="Exemplo" />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(
      screen.getByRole('img', { name: 'Imagem indisponível de Exemplo' }),
    ).toBeVisible();
  });
  it('configura proteção de nova aba e deixa o destino explícito', () => {
    render(<WhatsAppButton url="https://wa.me/12345678?text=teste" />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link')).toHaveAccessibleName(/abre em nova aba/);
  });
});
