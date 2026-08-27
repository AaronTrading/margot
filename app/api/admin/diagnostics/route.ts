import { requireAdmin } from '@/lib/adminAuth';
import {
  adminApiError,
  getSupabaseAdmin,
  getSupabaseConfig,
} from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const tables = ['clients', 'client_notes', 'reminders', 'resources'] as const;

export async function GET() {
  try {
    const unauthorized = await requireAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    const { url } = getSupabaseConfig();
    const supabase = getSupabaseAdmin();
    const checks = await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabase.from(table).select('id').limit(1);

        return {
          error: error?.message ?? null,
          ok: !error,
          table,
        };
      }),
    );

    return Response.json({
      ok: checks.every((check) => check.ok),
      supabaseHost: new URL(url).hostname,
      tables: checks,
    });
  } catch (error) {
    return adminApiError(error);
  }
}
