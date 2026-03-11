import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    // Uses `.env.local` values during development
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
