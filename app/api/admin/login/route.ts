import { setAdminCookie, verifyAdminPassword } from '@/lib/adminAuth';
import { adminApiError } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    return adminApiError(error);
  }
}
