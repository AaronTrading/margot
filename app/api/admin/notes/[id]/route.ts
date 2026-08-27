import { requireAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin, normalizeEmpty } from '@/lib/supabaseAdmin';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: Context) {
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
    .from('client_notes')
    .update({
      content: normalizeEmpty(body.content),
      note_date: normalizeEmpty(body.note_date),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ note: data });
}

export async function DELETE(_request: Request, context: Context) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const { error } = await getSupabaseAdmin()
    .from('client_notes')
    .delete()
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
