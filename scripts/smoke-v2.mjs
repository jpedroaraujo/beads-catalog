import assert from 'node:assert/strict';

const [address, ...options] = process.argv.slice(2);
if (!address || options.some((option) => option !== '--require-access')) {
  console.error('Uso: npm run smoke:v2 -- <URL-do-Worker> [--require-access]');
  process.exit(1);
}

const origin = new URL(address);
assert.ok(
  ['http:', 'https:'].includes(origin.protocol),
  'Informe uma URL HTTP ou HTTPS.',
);
assert.ok(
  !origin.username && !origin.password,
  'Informe a URL sem credenciais.',
);
const requireAccess = options.includes('--require-access');
const missingImage = '00000000-0000-4000-8000-000000000000';

function get(path) {
  return fetch(new URL(path, origin), {
    headers: { 'User-Agent': 'beads-catalog-smoke/1.0' },
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
  });
}

function isAccessRedirect(response) {
  const location = response.headers.get('Location');
  if (!location || ![301, 302, 303, 307, 308].includes(response.status))
    return false;
  const target = new URL(location, origin);
  return (
    target.protocol === 'https:' &&
    (target.hostname.endsWith('.cloudflareaccess.com') ||
      (target.origin === origin.origin &&
        target.pathname.startsWith('/cdn-cgi/access/')))
  );
}

async function protect(path) {
  const response = await get(path);
  const redirect = isAccessRedirect(response);
  if (path === '/admin' && requireAccess) {
    assert.ok(
      redirect,
      `/admin deve redirecionar para o Access (HTTP ${response.status}).`,
    );
  } else {
    assert.ok(
      redirect || [401, 403].includes(response.status),
      `${path} deve exigir autorização (HTTP ${response.status}).`,
    );
  }
  await response.body?.cancel();
}

const page = await get('/');
assert.equal(page.status, 200, 'A vitrine deve estar pública.');
assert.match(await page.text(), /id="root"/, 'A vitrine deve servir a SPA.');

const response = await get('/api/catalog');
assert.equal(
  response.status,
  200,
  'O catálogo deve responder sem sessão administrativa.',
);
const catalog = await response.json();
assert.ok(
  Array.isArray(catalog.categories) && Array.isArray(catalog.products),
  'Resposta de catálogo inválida.',
);
assert.ok(
  catalog.products.every(
    (item) => !('visible' in item) && !('revision' in item),
  ),
  'A API pública expôs campos administrativos.',
);

const missing = await get(`/api/catalog/images/${missingImage}`);
assert.equal(missing.status, 404, 'Uma imagem inexistente deve retornar 404.');
await missing.body?.cancel();

await Promise.all([
  protect('/admin'),
  protect('/api/admin/catalog'),
  protect(`/api/admin/images/${missingImage}`),
]);
console.log(
  'Vitrine pública, catálogo, rota de fotos e proteção administrativa verificados.',
);
