import { requireAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin, normalizeEmpty } from '@/lib/supabaseAdmin';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

function resourcePayload(body: Record<string, unknown>) {
  return {
    content: normalizeEmpty(body.content),
    note: normalizeEmpty(body.note),
    title: normalizeEmpty(body.title),
    type: normalizeEmpty(body.type) ?? 'other',
  };
}

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
    .from('resources')
    .update(resourcePayload(body))
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ resource: data });
}

export async function DELETE(_request: Request, context: Context) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const { error } = await getSupabaseAdmin()
    .from('resources')
    .delete()
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
