import { requireAdmin } from '@/lib/adminAuth';
import { resourcePayload } from '@/lib/resources';
import {
  adminApiError,
  getSupabaseAdmin,
  supabaseErrorResponse,
} from '@/lib/supabaseAdmin';

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
    const supabase = getSupabaseAdmin();

    if (payload.type === 'recipe' && !payload.category) {
      return Response.json(
        { error: 'La catégorie est requise pour une recette.' },
        { status: 400 },
      );
    }

    const { data: existingResource, error: lookupError } = await supabase
      .from('resources')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) {
      return supabaseErrorResponse(lookupError, 'lecture de la ressource');
    }

    if (!existingResource) {
      return Response.json(
        {
          error:
            'Cette ressource est introuvable. Recharge la page admin avant de réessayer.',
        },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from('resources')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return Response.json(
          {
            error:
              'Cette adresse de recette existe déjà. Choisis une URL différente.',
          },
          { status: 400 },
        );
      }

      return supabaseErrorResponse(error, 'modification de la ressource');
    }

    if (!data) {
      return Response.json(
        {
          error:
            'La ressource existe, mais Supabase n’a renvoyé aucune ligne après modification. Vérifie que SUPABASE_SERVICE_ROLE_KEY contient bien la clé secrète/service role dans Vercel, puis redéploie.',
        },
        { status: 500 },
      );
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
      return supabaseErrorResponse(error, 'suppression de la ressource');
    }

    return Response.json({ ok: true });
  } catch (error) {
    return adminApiError(error);
  }
}
