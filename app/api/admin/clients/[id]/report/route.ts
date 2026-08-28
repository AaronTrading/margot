import { requireAdmin } from '@/lib/adminAuth';
import {
  adminApiError,
  getSupabaseAdmin,
  normalizeEmpty,
  supabaseErrorResponse,
} from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const unauthorized = await requireAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const { data, error } = await getSupabaseAdmin()
      .from('clients')
      .update({
        report: normalizeEmpty(body.report),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return supabaseErrorResponse(error, 'sauvegarde du compte rendu');
    }

    return Response.json({ client: data });
  } catch (error) {
    return adminApiError(error);
  }
}
