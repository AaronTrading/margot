import { requireAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin, normalizeEmpty } from '@/lib/supabaseAdmin';

function resourcePayload(body: Record<string, unknown>) {
  return {
    content: normalizeEmpty(body.content),
    note: normalizeEmpty(body.note),
    title: normalizeEmpty(body.title),
    type: normalizeEmpty(body.type) ?? 'other',
  };
}

export async function GET() {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { data, error } = await getSupabaseAdmin()
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ resources: data ?? [] });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const payload = resourcePayload(body);

  if (!payload.title) {
    return Response.json({ error: 'Le titre est requis.' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('resources')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ resource: data });
}
