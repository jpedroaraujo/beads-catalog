import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface AccessConfig {
  readonly ACCESS_TEAM_DOMAIN?: string;
  readonly ACCESS_AUD?: string;
  readonly ADMIN_EMAILS?: string;
}

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function hasAccess(
  request: Request,
  config: AccessConfig,
): Promise<boolean> {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  const team = config.ACCESS_TEAM_DOMAIN;
  const audience = config.ACCESS_AUD;
  const emails = new Set(
    config.ADMIN_EMAILS?.split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
  if (
    !token ||
    !audience ||
    emails.size !== 2 ||
    !team ||
    !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team)
  )
    return false;

  const issuer = `https://${team}`;
  let keys = keySets.get(issuer);
  if (!keys) {
    keys = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', issuer));
    keySets.set(issuer, keys);
  }

  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer,
      audience,
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'sub', 'email'],
    });
    return (
      typeof payload.email === 'string' &&
      emails.has(payload.email.toLowerCase())
    );
  } catch {
    return false;
  }
}
