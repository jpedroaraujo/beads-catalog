import { useEffect, useState } from 'react';
import { parseCatalog } from '../lib/catalog';
import type { Catalog } from '../types/catalog';
import { CatalogPage } from './CatalogPage';

type CatalogState =
  | { readonly state: 'loading' }
  | { readonly state: 'error' }
  | { readonly state: 'ready'; readonly catalog: Catalog };

export function RemoteApp() {
  const [catalogState, setCatalogState] = useState<CatalogState>({
    state: 'loading',
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        const response = await fetch('/api/catalog', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Falha na consulta do catálogo.');
        const data: unknown = await response.json();
        if (!controller.signal.aborted) {
          setCatalogState({ state: 'ready', catalog: parseCatalog(data) });
        }
      } catch {
        if (!controller.signal.aborted) setCatalogState({ state: 'error' });
      }
    }

    void loadCatalog();
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setCatalogState({ state: 'loading' });
    setAttempt((previous) => previous + 1);
  }

  if (catalogState.state === 'error') {
    return <CatalogPage state="error" demonstration onRetry={retry} />;
  }
  return <CatalogPage {...catalogState} demonstration />;
}
