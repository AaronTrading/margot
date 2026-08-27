import { requireAdmin } from '@/lib/adminAuth';
import {
  adminApiError,
  getSupabaseAdmin,
  normalizeEmpty,
} from '@/lib/supabaseAdmin';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const unauthorized = await requireAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const { data, error } = await getSupabaseAdmin()
      .from('client_notes')
      .select('*')
      .eq('client_id', id)
      .order('note_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ notes: data ?? [] });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function POST(request: Request, context: Context) {
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
    const content = normalizeEmpty(body.content);

    if (!content) {
      return Response.json({ error: 'La note est vide.' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('client_notes')
      .insert({
        client_id: id,
        content,
        note_date: normalizeEmpty(body.note_date),
      })
      .select('*')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ note: data });
  } catch (error) {
    return adminApiError(error);
  }
}
