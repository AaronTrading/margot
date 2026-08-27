import { createClient } from '@supabase/supabase-js';

export function getSupabaseConfig() {
  const url = (
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Configuration Supabase incomplète. Vérifie SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL, puis SUPABASE_SERVICE_ROLE_KEY dans les variables Vercel.',
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(
      'URL Supabase invalide. Elle doit ressembler à https://xxxx.supabase.co',
    );
  }

  if (!parsedUrl.hostname.endsWith('.supabase.co')) {
    throw new Error(
      'URL Supabase suspecte. Utilise bien la Project URL Supabase au format https://xxxx.supabase.co',
    );
  }

  return {
    serviceRoleKey,
    url,
  };
}

export function getSupabaseAdmin() {
  const { serviceRoleKey, url } = getSupabaseConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: async (input, init) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        try {
          return await fetch(input, {
            ...init,
            signal: controller.signal,
          });
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(
              'Supabase ne répond pas dans le délai prévu. Vérifie que le projet Supabase est actif et que l’URL pointe vers le bon projet.',
            );
          }

          throw error;
        } finally {
          clearTimeout(timeout);
        }
      },
    },
  });
}

export function adminApiError(error: unknown) {
  const message =
    error instanceof Error ? error.message : 'Une erreur serveur est survenue.';

  console.error('[admin-api]', message, error);

  if (message === 'fetch failed') {
    return Response.json(
      {
        error:
          'Impossible de joindre Supabase. Vérifie l’URL du projet Supabase et les variables Vercel, puis redéploie.',
      },
      { status: 500 },
    );
  }

  return Response.json({ error: message }, { status: 500 });
}

export function normalizeEmpty(value: unknown) {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const numeric = Number(value);

  return Number.isFinite(numeric) ? numeric : null;
}
