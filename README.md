# High-Performance Systems IQ Quiz

Lead-generation quiz platform for conference traffic, built with Next.js App Router, Tailwind CSS, Supabase, and Lucide icons.

## Quick start

1. Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

2. Copy the values from [`.env.example`](./.env.example) and fill in your Supabase project keys.

3. Install dependencies:

```bash
npm install
```

4. Apply the database schema from [`supabase/schema.sql`](./supabase/schema.sql).

5. Create at least one Supabase auth user for the admin login, then mark that user as an admin:

```sql
insert into public.admin_profiles (user_id, display_name, role)
values ('YOUR_AUTH_USER_UUID', 'Conference Admin', 'admin');
```

6. Run the app:

```bash
npm run dev
```

If Supabase variables are missing, the app falls back to seeded demo data so the UI can still be reviewed locally.
