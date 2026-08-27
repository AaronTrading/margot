import {
  clearAdminCookie,
  isAdminAuthenticated,
  requireAdmin,
} from '@/lib/adminAuth';
import { adminApiError } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return Response.json({ authenticated: await isAdminAuthenticated() });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function DELETE() {
  try {
    const unauthorized = await requireAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    await clearAdminCookie();

    return Response.json({ authenticated: false });
  } catch (error) {
    return adminApiError(error);
  }
}
