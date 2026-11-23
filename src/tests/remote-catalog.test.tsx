import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RemoteApp } from '../app/RemoteApp';
import { categories } from '../data/categories';
import { products } from '../data/products';

afterEach(() => vi.unstubAllGlobals());

describe('catálogo remoto', () => {
  it('distingue carregamento e falha, e oferece nova tentativa', async () => {
    const fetchCatalog = vi
      .fn()
      .mockResolvedValueOnce(Response.json({}, { status: 503 }))
      .mockResolvedValueOnce(
        Response.json({ categories, products: [products[5]] }),
      );
    vi.stubGlobal('fetch', fetchCatalog);

    render(<RemoteApp />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar',
    );
    expect(screen.queryByText(/Ainda não há peças/)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );
    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Ver detalhes de Margarida solar',
      }),
    );

    expect(
      screen.getByRole('button', { name: 'Peça indisponível' }),
    ).toBeDisabled();
    expect(fetchCatalog).toHaveBeenCalledTimes(2);
  });

  it('diferencia resposta válida vazia de dados remotos inválidos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          categories,
          products: [{ ...products[0], available: 'false' }],
        }),
      ),
    );
    const view = render(<RemoteApp />);
    expect(await screen.findByRole('alert')).toBeVisible();
    view.unmount();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ categories, products: [] })),
    );
    render(<RemoteApp />);
    expect(
      await screen.findByText(/Ainda não há peças no catálogo/),
    ).toBeVisible();
  });
});
