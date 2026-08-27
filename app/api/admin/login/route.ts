import { setAdminCookie, verifyAdminPassword } from '@/lib/adminAuth';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;

  if (!body?.password || !(await verifyAdminPassword(body.password))) {
    return Response.json(
      { error: 'Mot de passe incorrect' },
      { status: 401 },
    );
  }

  await setAdminCookie();

  return Response.json({ authenticated: true });
}
