import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento raiz da aplicação não encontrado.');

function loadV2() {
  const pathname = window.location.pathname;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return import('./app/AdminApp').then(({ AdminApp }) => AdminApp);
  }
  return import('./app/RemoteApp').then(({ RemoteApp }) => RemoteApp);
}

const application =
  import.meta.env.MODE === 'v2'
    ? loadV2()
    : import('./app/App').then(({ App }) => App);

void application.then((App) => {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
