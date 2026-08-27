import { requireAdmin } from '@/lib/adminAuth';
import {
  adminApiError,
  getSupabaseAdmin,
  getSupabaseConfig,
  mapSupabaseCheckError,
} from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const checks = [
  {
    name: 'clients',
    select:
      'id,first_name,last_name,phone,email,goals,status,short_note,weight_kg,height_cm,allergies,intolerances,created_at,updated_at',
    table: 'clients',
  },
  {
    name: 'client_notes',
    select: 'id,client_id,note_date,content,created_at,updated_at',
    table: 'client_notes',
  },
  {
    name: 'reminders',
    select: 'id,client_id,title,due_date,status,note,created_at,updated_at',
    table: 'reminders',
  },
  {
    name: 'resources',
    select: 'id,title,type,content,note,created_at,updated_at',
    table: 'resources',
  },
  {
    name: 'reminders → clients relation',
    select: 'id,clients(first_name,last_name)',
    table: 'reminders',
  },
] as const;

export async function GET() {
  try {
    const unauthorized = await requireAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    const { url } = getSupabaseConfig();
    const supabase = getSupabaseAdmin();
    const tableChecks = await Promise.all(
      checks.map(async (check) => {
        const { error } = await supabase
          .from(check.table)
          .select(check.select)
          .limit(1);

        return {
          error: mapSupabaseCheckError(error),
          ok: !error,
          table: check.name,
        };
      }),
    );

    return Response.json({
      ok: tableChecks.every((check) => check.ok),
      supabaseHost: new URL(url).hostname,
      tables: tableChecks,
    });
  } catch (error) {
    return adminApiError(error);
  }
}
