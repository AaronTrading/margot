import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'margot_admin_session';
const SESSION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  exp: number;
  iat: number;
};

function getSecret() {
  const secret = process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error('ADMIN_PASSWORD is missing');
  }

  return secret;
}

function base64Url(input: string) {
  return Buffer.from(input).toString('base64url');
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function createToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64Url(
    JSON.stringify({
      exp: now + SESSION_SECONDS,
      iat: now,
    } satisfies SessionPayload),
  );

  return `${payload}.${sign(payload)}`;
}

function verifyToken(token?: string) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return false;
  }

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString(),
    ) as SessionPayload;

    return parsed.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();

  return verifyToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

export async function verifyAdminPassword(password: string) {
  const secret = getSecret();
  const passwordBuffer = Buffer.from(password);
  const secretBuffer = Buffer.from(secret);

  return (
    passwordBuffer.length === secretBuffer.length &&
    timingSafeEqual(passwordBuffer, secretBuffer)
  );
}

export async function setAdminCookie() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    maxAge: SESSION_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
