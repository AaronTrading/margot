import { requireAdmin } from '@/lib/adminAuth';
import { resourcePayload } from '@/lib/resources';
import {
  adminApiError,
  getSupabaseAdmin,
  supabaseErrorResponse,
} from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

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
      return supabaseErrorResponse(error, 'chargement des ressources');
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

    if (payload.type === 'recipe' && !payload.category) {
      return Response.json(
        { error: 'La catégorie est requise pour une recette.' },
        { status: 400 },
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from('resources')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return supabaseErrorResponse(error, 'création de la ressource');
    }

    return Response.json({ resource: data });
  } catch (error) {
    return adminApiError(error);
  }
}
