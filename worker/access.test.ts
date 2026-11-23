// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { hasAccess } from './access';
import worker from './index';
import type { Env } from './index';

const config = {
  ACCESS_TEAM_DOMAIN: 'catalog-test.cloudflareaccess.com',
  ACCESS_AUD: 'catalog-application',
  ADMIN_EMAILS: 'first@example.com, second@example.com',
};

afterEach(() => vi.unstubAllGlobals());

describe('proteção administrativa do Worker', () => {
  it('nega acesso direto ao painel e à API sem um token válido', async () => {
    const env = config as Env;
    for (const path of [
      '/admin',
      '/admin/',
      '/api/admin/catalog',
      '/api/admin/products',
    ]) {
      const response = await worker.fetch(
        new Request(`https://catalog.example${path}`),
        env,
      );
      expect(response.status).toBe(403);
    }
  });

  it('confere assinatura, emissor, público, validade e e-mail autorizado', async () => {
    const issuer = `https://${config.ACCESS_TEAM_DOMAIN}`;
    const { publicKey, privateKey } = await generateKeyPair('RS256', {
      extractable: true,
    });
    const otherKeys = await generateKeyPair('RS256');
    const publicJwk = await exportJWK(publicKey);
    const fetchKeys = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          Response.json({ keys: [{ ...publicJwk, kid: 'test-key' }] }),
        ),
      );
    vi.stubGlobal('fetch', fetchKeys);

    function token(
      email: string,
      options: {
        audience?: string;
        issuer?: string;
        expires?: string;
        signingKey?: typeof privateKey;
      } = {},
    ) {
      return new SignJWT({ email })
        .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
        .setIssuer(options.issuer ?? issuer)
        .setSubject('admin-user')
        .setAudience(options.audience ?? config.ACCESS_AUD)
        .setExpirationTime(options.expires ?? '5m')
        .sign(options.signingKey ?? privateKey);
    }

    function request(value: string) {
      return new Request('https://catalog.example/api/admin/catalog', {
        headers: { 'Cf-Access-Jwt-Assertion': value },
      });
    }

    expect(
      await hasAccess(request(await token('first@example.com')), config),
    ).toBe(true);
    expect(
      await hasAccess(request(await token('second@example.com')), config),
    ).toBe(true);
    expect(
      await hasAccess(request(await token('outside@example.com')), config),
    ).toBe(false);
    expect(
      await hasAccess(
        request(await token('first@example.com', { audience: 'unrelated' })),
        config,
      ),
    ).toBe(false);
    expect(
      await hasAccess(
        request(
          await token('first@example.com', {
            issuer: 'https://unrelated.example',
          }),
        ),
        config,
      ),
    ).toBe(false);
    expect(
      await hasAccess(
        request(await token('first@example.com', { expires: '1m ago' })),
        config,
      ),
    ).toBe(false);
    expect(
      await hasAccess(
        request(
          await token('first@example.com', {
            signingKey: otherKeys.privateKey,
          }),
        ),
        config,
      ),
    ).toBe(false);
    expect(fetchKeys).toHaveBeenCalledTimes(1);
  });
});
