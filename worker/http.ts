export function json(
  body: unknown,
  status = 200,
  headers?: HeadersInit,
): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Cache-Control', 'no-store');
  return Response.json(body, { status, headers: responseHeaders });
}

export function problem(
  error: string,
  status: number,
  headers?: HeadersInit,
): Response {
  return json({ error }, status, headers);
}

export function methodNotAllowed(allow: string): Response {
  return problem('Método não permitido.', 405, { Allow: allow });
}

export function allowsMutation(request: Request, url: URL): boolean {
  const origin = request.headers.get('Origin');
  return (
    (!origin || origin === url.origin) &&
    request.headers.get('Sec-Fetch-Site') !== 'cross-site'
  );
}

export function contentType(request: Request): string | undefined {
  return request.headers
    .get('Content-Type')
    ?.split(';')[0]
    ?.trim()
    .toLowerCase();
}
