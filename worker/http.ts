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
