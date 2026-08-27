import {
  clearAdminCookie,
  isAdminAuthenticated,
  requireAdmin,
} from '@/lib/adminAuth';

export async function GET() {
  return Response.json({ authenticated: await isAdminAuthenticated() });
}

export async function DELETE() {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  await clearAdminCookie();

  return Response.json({ authenticated: false });
}
