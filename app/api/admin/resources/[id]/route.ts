import { requireAdmin } from '@/lib/adminAuth';
import { resourcePayload } from '@/lib/resources';
import { adminApiError, getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

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
    const payload = resourcePayload(body);

    if (payload.type === 'recipe' && !payload.category) {
      return Response.json(
        { error: 'La catégorie est requise pour une recette.' },
        { status: 400 },
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from('resources')
      .update(payload)
      .eq('id', id)
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

export async function DELETE(_request: Request, context: Context) {
  try {
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
  } catch (error) {
    return adminApiError(error);
  }
}
