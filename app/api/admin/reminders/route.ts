import { requireAdmin } from '@/lib/adminAuth';
import {
  adminApiError,
  getSupabaseAdmin,
  normalizeEmpty,
  supabaseErrorResponse,
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
      .select('*')
      .order('status', { ascending: false })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      return supabaseErrorResponse(error, 'chargement des rappels');
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
      .select('*')
      .single();

    if (error) {
      return supabaseErrorResponse(error, 'création du rappel');
    }

    return Response.json({ reminder: data });
  } catch (error) {
    return adminApiError(error);
  }
}
