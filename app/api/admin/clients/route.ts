import { requireAdmin } from '@/lib/adminAuth';
import {
  adminApiError,
  getSupabaseAdmin,
  normalizeEmpty,
  normalizeNumber,
} from '@/lib/supabaseAdmin';

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

export async function GET(request: Request) {
  try {
    const unauthorized = await requireAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const status = searchParams.get('status')?.trim();
    const supabase = getSupabaseAdmin();
    let requestBuilder = supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      requestBuilder = requestBuilder.eq('status', status);
    }

    if (query) {
      requestBuilder = requestBuilder.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`,
      );
    }

    const { data, error } = await requestBuilder;

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ clients: data ?? [] });
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
    const payload = clientPayload(body);

    if (!payload.first_name && !payload.last_name) {
      return Response.json(
        { error: 'Le prénom ou le nom est requis.' },
        { status: 400 },
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from('clients')
      .insert(payload)
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
