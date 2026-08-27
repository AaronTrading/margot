import { requireAdmin } from '@/lib/adminAuth';
import {
  adminApiError,
  getSupabaseAdmin,
  normalizeEmpty,
} from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

function reminderPayload(body: Record<string, unknown>) {
  return {
    client_id: normalizeEmpty(body.client_id),
    due_date: normalizeEmpty(body.due_date),
    note: normalizeEmpty(body.note),
    status: normalizeEmpty(body.status) ?? 'todo',
    title: normalizeEmpty(body.title),
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
      .from('reminders')
      .update(reminderPayload(body))
      .eq('id', id)
      .select('*, clients(first_name,last_name)')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ reminder: data });
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
      .from('reminders')
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
