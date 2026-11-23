import { hasAccess } from './access';
import type { AccessConfig } from './access';
import { handleAdmin } from './admin';
import { readCatalog } from './catalog';
import { handleGallery } from './gallery';
import { cleanImages, serveImage } from './image-storage';
import type { ImageStorage } from './image-storage';
import { json, methodNotAllowed, problem } from './http';

export interface Env extends AccessConfig, ImageStorage {
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
      if (adminApi) {
        const photo = /^\/api\/admin\/images\/([^/]+)$/.exec(pathname)?.[1];
        if (photo) return await serveImage(request, env, photo, true);
        const gallery = await handleGallery(request, url, env);
        if (gallery) return gallery;
        const response = await handleAdmin(request, url, env.DB);
        if (
          response.ok &&
          request.method === 'DELETE' &&
          pathname.startsWith('/api/admin/products/')
        ) {
          await cleanImages(env);
        }
        return response;
      }
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
    const photo = /^\/api\/catalog\/images\/([^/]+)$/.exec(pathname)?.[1];
    if (photo) return await serveImage(request, env, photo, false);
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
  scheduled(
    _controller: ScheduledController,
    env: Env,
    context: ExecutionContext,
  ): void {
    context.waitUntil(cleanImages(env));
  },
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
