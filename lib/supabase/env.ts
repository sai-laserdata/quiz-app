export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Demo mode bypasses admin authentication completely and stores data in a local
 * JSON file, so it is only ever safe during local development. Anywhere else a
 * missing Supabase configuration is a deployment error and must fail closed --
 * otherwise a preview deployment without env vars serves the admin dashboard,
 * participant PII, and the CSV export to anyone holding the URL.
 */
export function isDemoModeAllowed() {
  return process.env.NODE_ENV === 'development';
}

/** Non-throwing check, for rendering the "Demo mode" badge. */
export function isDemoMode() {
  return !hasSupabaseEnv() && isDemoModeAllowed();
}

/**
 * Single decision point for which backend to use. Throws instead of silently
 * downgrading to the unauthenticated demo store in a deployed environment.
 */
export function shouldUseDemoStore() {
  if (hasSupabaseEnv()) {
    return false;
  }

  if (!isDemoModeAllowed()) {
    throw new Error(
      'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL, ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY for this environment ' +
        '(including Preview deployments).'
    );
  }

  return true;
}
