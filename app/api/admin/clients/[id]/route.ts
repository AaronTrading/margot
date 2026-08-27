import { requireAdmin } from '@/lib/adminAuth';
import {
  adminApiError,
  getSupabaseAdmin,
  normalizeEmpty,
  normalizeNumber,
} from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

function clientPayload(body: Record<string, unknown>) {
  return {
    allergies: normalizeEmpty(body.allergies),
    email: normalizeEmpty(body.email),
    first_name: normalizeEmpty(body.first_name),
    goals: normalizeEmpty(body.goals),
    height_cm: normalizeNumber(body.height_cm),
    intolerances: normalizeEmpty(body.intolerances),
    last_name: normalizeEmpty(body.last_name),
    phone: normalizeEmpty(body.phone),
    short_note: normalizeEmpty(body.short_note),
    status: normalizeEmpty(body.status) ?? 'active',
    weight_kg: normalizeNumber(body.weight_kg),
  };
}

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
      .update(clientPayload(body))
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ client: data });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const unauthorized = await requireAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const { error } = await getSupabaseAdmin()
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return adminApiError(error);
  }
}
