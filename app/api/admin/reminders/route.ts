import { requireAdmin } from '@/lib/adminAuth';
import {
  adminApiError,
  getSupabaseAdmin,
  normalizeEmpty,
} from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

function reminderPayload(body: Record<string, unknown>) {
  return {
    client_id: normalizeEmpty(body.client_id),
    due_date: normalizeEmpty(body.due_date),
    note: normalizeEmpty(body.note),
    status: normalizeEmpty(body.status) ?? 'todo',
    title: normalizeEmpty(body.title),
  };
}

export async function GET() {
  try {
    const unauthorized = await requireAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    const { data, error } = await getSupabaseAdmin()
      .from('reminders')
      .select('*, clients(first_name,last_name)')
      .order('status', { ascending: false })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ reminders: data ?? [] });
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
    const payload = reminderPayload(body);

    if (!payload.title) {
      return Response.json({ error: 'Le titre est requis.' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('reminders')
      .insert(payload)
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
