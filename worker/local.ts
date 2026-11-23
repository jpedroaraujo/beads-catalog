import worker, { handleRequest } from './index';
import type { Env } from './index';

export default {
  scheduled: worker.scheduled,
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env, (adminRequest) =>
      Promise.resolve(new URL(adminRequest.url).hostname === '127.0.0.1'),
    );
  },
};
