import { useEffect, useRef, useState } from 'react';
import { CategoryEditor } from '../components/admin/CategoryEditor';
import { GalleryEditor } from '../components/admin/GalleryEditor';
import { ProductEditor } from '../components/admin/ProductEditor';
import { parseAdminCatalog } from '../lib/admin-catalog';
import { isRecord } from '../lib/catalog';
import { formatProductPrice } from '../lib/pricing';
import type {
  AdminCatalog,
  AdminCategory,
  AdminProduct,
} from '../types/admin-catalog';

type Editor =
  | { readonly type: 'products'; readonly item: AdminProduct | null }
  | { readonly type: 'categories'; readonly item: AdminCategory | null };

type Selection =
  Editor | { readonly type: 'gallery'; readonly productId: string };

type Mutation = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function sendAdminRequest(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  const response = await fetch(`/api/admin/${path}`, {
    ...init,
    redirect: 'manual',
  });
  if (
    response.status === 401 ||
    response.status === 403 ||
    response.type === 'opaqueredirect'
  ) {
    throw new Error(
      'Acesso administrativo necessário. Reabra o painel para entrar novamente.',
    );
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      isRecord(data) && typeof data.error === 'string'
        ? data.error
        : 'Não foi possível concluir a operação.',
    );
  }
  return data;
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação.';
}

export function AdminApp() {
  const [catalog, setCatalog] = useState<AdminCatalog | null>(null);
  const [editor, setEditor] = useState<Selection | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const actionsDisabled = loading || busy || readError !== null;
  const galleryProduct =
    editor?.type === 'gallery'
      ? catalog?.products.find(({ id }) => id === editor.productId)
      : undefined;

  useEffect(() => {
    const abort = new AbortController();
    async function load() {
      try {
        const next = parseAdminCatalog(
          await sendAdminRequest('catalog', { signal: abort.signal }),
        );
        if (!abort.signal.aborted) setCatalog(next);
      } catch (error) {
        if (!abort.signal.aborted) setReadError(errorMessage(error));
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => abort.abort();
  }, [refresh]);

  useEffect(() => {
    if (editor) editorRef.current?.focus();
  }, [editor]);

  function reload() {
    setLoading(true);
    setReadError(null);
    setRefresh((previous) => previous + 1);
  }

  function select(next: Selection | null) {
    setEditor(next);
    setWriteError(null);
    setConfirmation('');
  }

  function save(
    path: string,
    method: Mutation,
    data: object,
    message: string,
    closeEditor = false,
  ) {
    return persist(
      path,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      message,
      closeEditor,
    );
  }

  async function persist(
    path: string,
    request: RequestInit,
    message: string,
    closeEditor = false,
  ) {
    setBusy(true);
    setWriteError(null);
    setConfirmation('');
    try {
      const result = await sendAdminRequest(path, request);
      if (!isRecord(result) || typeof result.id !== 'string') {
        throw new Error(
          'Não foi possível confirmar a alteração. Atualize a lista antes de tentar novamente.',
        );
      }
      if (closeEditor) setEditor(null);
      setConfirmation(message);
      reload();
    } catch (error) {
      setWriteError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function saveEditor(inputs: object, entry: Editor) {
    if (entry.item) {
      void save(
        `${entry.type}/${encodeURIComponent(entry.item.id)}`,
        'PUT',
        { ...inputs, revision: entry.item.revision },
        'Alterações salvas.',
        true,
      );
    } else {
      void save(entry.type, 'POST', inputs, 'Cadastro criado.', true);
    }
  }

  function remove(type: Editor['type'], item: AdminCategory | AdminProduct) {
    if (!window.confirm(`Excluir “${item.name}” permanentemente?`)) return;
    void save(
      `${type}/${encodeURIComponent(item.id)}`,
      'DELETE',
      { revision: item.revision },
      'Cadastro excluído.',
    );
  }

  return (
    <main className="page-container grid gap-6 py-8 sm:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">
          Administração do catálogo
        </h1>
        <a className="nav-link" href="/">
          Ver catálogo
        </a>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="button-secondary"
          onClick={reload}
          disabled={loading || busy}
        >
          Atualizar lista
        </button>
        {loading && <p role="status">Carregando cadastros…</p>}
        {confirmation && <p role="status">{confirmation}</p>}
      </div>
      {readError && (
        <p role="alert" className="rounded-md border border-line bg-paper p-3">
          {readError}
        </p>
      )}
      {writeError && (
        <p role="alert" className="rounded-md border border-line bg-paper p-3">
          {writeError}
        </p>
      )}
      {catalog && (
        <>
          {editor && (
            <div ref={editorRef} tabIndex={-1} className="rounded-xl">
              {editor.type === 'products' ? (
                <ProductEditor
                  key={editor.item?.id ?? 'new-product'}
                  product={editor.item}
                  categories={catalog.categories}
                  busy={busy}
                  onCancel={() => select(null)}
                  onSave={(inputs) => void saveEditor(inputs, editor)}
                />
              ) : editor.type === 'categories' ? (
                <CategoryEditor
                  key={editor.item?.id ?? 'new-category'}
                  category={editor.item}
                  busy={busy}
                  onCancel={() => select(null)}
                  onSave={(inputs) => void saveEditor(inputs, editor)}
                />
              ) : galleryProduct ? (
                <GalleryEditor
                  key={galleryProduct.id}
                  product={galleryProduct}
                  busy={actionsDisabled}
                  onClose={() => select(null)}
                  onChange={(suffix, request, message) =>
                    void persist(
                      `products/${encodeURIComponent(galleryProduct.id)}/images${suffix}`,
                      request,
                      message,
                    )
                  }
                />
              ) : (
                <>
                  <p>O produto foi removido.</p>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => select(null)}
                  >
                    Fechar galeria
                  </button>
                </>
              )}
            </div>
          )}
          <section aria-labelledby="admin-products" className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="admin-products" className="font-display text-2xl">
                Produtos
              </h2>
              <button
                type="button"
                className="button-secondary"
                disabled={
                  actionsDisabled || !!editor || catalog.categories.length === 0
                }
                onClick={() => select({ type: 'products', item: null })}
              >
                Novo produto
              </button>
            </div>
            {catalog.categories.length === 0 && (
              <p>Crie uma categoria para cadastrar produtos.</p>
            )}
            {catalog.products.length === 0 && <p>Nenhum produto cadastrado.</p>}
            <ul className="grid gap-2">
              {catalog.products.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper p-4"
                >
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted">
                      {item.visible ? 'Visível' : 'Oculto'} ·{' '}
                      {item.available ? 'Aceita encomenda' : 'Indisponível'} ·{' '}
                      {formatProductPrice(item.pricing)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={actionsDisabled || !!editor}
                      aria-label={`${item.visible ? 'Ocultar do catálogo' : 'Reexibir no catálogo'}: ${item.name}`}
                      onClick={() =>
                        void save(
                          `products/${encodeURIComponent(item.id)}`,
                          'PATCH',
                          { revision: item.revision, visible: !item.visible },
                          item.visible
                            ? 'Produto ocultado.'
                            : 'Produto reexibido.',
                        )
                      }
                    >
                      {item.visible
                        ? 'Ocultar do catálogo'
                        : 'Reexibir no catálogo'}
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={actionsDisabled || !!editor}
                      aria-label={`Editar ${item.name}`}
                      onClick={() => select({ type: 'products', item })}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={actionsDisabled || !!editor}
                      aria-label={`Fotos de ${item.name}`}
                      onClick={() =>
                        select({ type: 'gallery', productId: item.id })
                      }
                    >
                      Fotos
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={actionsDisabled || !!editor}
                      aria-label={`Excluir ${item.name}`}
                      onClick={() => remove('products', item)}
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="admin-categories" className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="admin-categories" className="font-display text-2xl">
                Categorias
              </h2>
              <button
                type="button"
                className="button-secondary"
                disabled={actionsDisabled || !!editor}
                onClick={() => select({ type: 'categories', item: null })}
              >
                Nova categoria
              </button>
            </div>
            {catalog.categories.length === 0 && (
              <p>Nenhuma categoria cadastrada.</p>
            )}
            <ul className="grid gap-2">
              {catalog.categories.map((item) => {
                const linked = catalog.products.some(
                  (product) => product.categoryId === item.id,
                );
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper p-4"
                  >
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted">{item.description}</p>
                      )}
                      {linked && (
                        <p className="text-sm text-muted">
                          Mova os produtos vinculados para excluir.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="button-secondary"
                        disabled={actionsDisabled || !!editor}
                        aria-label={`Editar categoria ${item.name}`}
                        onClick={() => select({ type: 'categories', item })}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="button-secondary"
                        disabled={actionsDisabled || !!editor || linked}
                        aria-label={`Excluir categoria ${item.name}`}
                        onClick={() => remove('categories', item)}
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
