import { requireAdmin } from '@/lib/adminAuth';
import {
  adminApiError,
  getSupabaseAdmin,
  normalizeEmpty,
} from '@/lib/supabaseAdmin';

function resourcePayload(body: Record<string, unknown>) {
  return {
    content: normalizeEmpty(body.content),
    note: normalizeEmpty(body.note),
    title: normalizeEmpty(body.title),
    type: normalizeEmpty(body.type) ?? 'other',
  };
}

export async function GET() {
  try {
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
  } catch (error) {
    return adminApiError(error);
  }
}

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    return adminApiError(error);
  }
}
