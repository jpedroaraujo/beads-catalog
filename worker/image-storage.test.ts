// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { maxImageBytes } from '../src/lib/image-upload';
import { readImageUpload } from './image-storage';

const png = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+xRGcAAAAASUVORK5CYII=',
  ),
  (character) => character.charCodeAt(0),
);

function request(body: Uint8Array<ArrayBuffer> | string, type: string) {
  return new Request('https://catalog.example/api/admin/products/abc/images', {
    method: 'POST',
    headers: { 'Content-Type': type },
    body,
  });
}

describe('validação de upload de foto', () => {
  it('reconhece uma foto PNG pelos bytes e devolve o tipo canônico', async () => {
    const result = await readImageUpload(
      request(png, 'application/octet-stream'),
    );
    expect(result).toEqual({ bytes: png, mime: 'image/png' });
  });

  it('recusa HTML renomeado e tipo declarado diferente do arquivo', async () => {
    const invalid = await readImageUpload(
      request('<html lang="pt-BR">Texto</html>', 'image/png'),
    );
    const mismatch = await readImageUpload(request(png, 'image/webp'));
    expect(invalid).toMatchObject({ status: 415 });
    expect(mismatch).toMatchObject({ status: 415 });
  });

  it('limita a leitura mesmo quando Content-Length está ausente', async () => {
    const chunk = new Uint8Array(1024 * 1024);
    let remaining = maxImageBytes + 1;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      duplex: 'half',
      body: new ReadableStream<Uint8Array>({
        pull(controller) {
          if (!remaining) return controller.close();
          const size = Math.min(remaining, chunk.byteLength);
          remaining -= size;
          controller.enqueue(chunk.subarray(0, size));
        },
      }),
    };
    const input = new Request(
      'https://catalog.example/api/admin/products/abc/images',
      options,
    );
    expect(input.headers.has('Content-Length')).toBe(false);
    const result = await readImageUpload(input);
    expect(result).toMatchObject({ status: 413 });
    if (result instanceof Response) {
      expect(await result.json()).toEqual({
        error: 'A foto deve ter até 50 MB.',
      });
    }
  });
});
