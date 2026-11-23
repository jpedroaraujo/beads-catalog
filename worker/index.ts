import { hasAccess } from './access';
import type { AccessConfig } from './access';
import { handleAdmin } from './admin';
import { readCatalog } from './catalog';
import { json, methodNotAllowed, problem } from './http';

export interface Env extends AccessConfig {
  readonly DB: D1Database;
  readonly ASSETS: Fetcher;
}

export async function handleRequest(
  request: Request,
  env: Env,
  authorize: (request: Request, env: Env) => Promise<boolean> = hasAccess,
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const adminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const adminApi =
    pathname === '/api/admin' || pathname.startsWith('/api/admin/');

  try {
    if (adminPage || adminApi) {
      if (!(await authorize(request, env))) {
        return problem('Acesso administrativo necessário.', 403);
      }
      if (adminApi) return await handleAdmin(request, url, env.DB);
      if (request.method !== 'GET' && request.method !== 'HEAD')
        return methodNotAllowed('GET, HEAD');
      const asset = await env.ASSETS.fetch(
        new Request(new URL('/', url), request),
      );
      const response = new Response(asset.body, asset);
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }
    if (pathname === '/api/catalog') {
      if (request.method !== 'GET') return methodNotAllowed('GET');
      return json(await readCatalog(env.DB, false));
    }
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return problem('Recurso não encontrado.', 404);
    }
    return await env.ASSETS.fetch(request);
  } catch (error) {
    console.error('Falha ao consultar o catálogo.', error);
    return problem('Não foi possível carregar o catálogo.', 503);
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
