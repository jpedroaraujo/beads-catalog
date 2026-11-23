import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminApp } from '../app/AdminApp';
import { categories } from '../data/categories';
import { products } from '../data/products';

afterEach(() => vi.unstubAllGlobals());

const adminCategories = categories.map((category) => ({
  ...category,
  revision: 1,
}));
const unavailable = { ...products[5], revision: 1, visible: true };

describe('painel administrativo', () => {
  it('oculta uma peça sem alterar a disponibilidade e atualiza a lista', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ categories: adminCategories, products: [unavailable] }),
      )
      .mockResolvedValueOnce(Response.json({ id: unavailable.id }))
      .mockResolvedValueOnce(
        Response.json({
          categories: adminCategories,
          products: [{ ...unavailable, visible: false, revision: 2 }],
        }),
      );
    vi.stubGlobal('fetch', request);

    const user = userEvent.setup();
    render(<AdminApp />);
    await user.click(
      await screen.findByRole('button', {
        name: 'Ocultar do catálogo: Margarida solar',
      }),
    );
    expect(
      await screen.findByRole('button', {
        name: 'Reexibir no catálogo: Margarida solar',
      }),
    ).toBeEnabled();
    expect(screen.getByText(/Oculto · Indisponível/)).toBeVisible();
    expect(request).toHaveBeenNthCalledWith(
      2,
      '/api/admin/products/margarida',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ revision: 1, visible: false }),
      }),
    );
  });

  it('preserva o formulário quando a gravação encontra uma edição concorrente', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ categories: adminCategories, products: [unavailable] }),
      )
      .mockResolvedValueOnce(
        Response.json({ error: 'O cadastro mudou.' }, { status: 409 }),
      );
    vi.stubGlobal('fetch', request);
    const user = userEvent.setup();
    render(<AdminApp />);
    await user.click(
      await screen.findByRole('button', { name: 'Editar Margarida solar' }),
    );
    const name = screen.getByRole('textbox', { name: 'Nome' });
    await user.clear(name);
    await user.type(name, 'Margarida em edição');
    await user.click(screen.getByRole('button', { name: 'Salvar produto' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O cadastro mudou.',
    );
    expect(name).toHaveValue('Margarida em edição');
  });
});
