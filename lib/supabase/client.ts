import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables are missing.')
    }

    try {
        new URL(supabaseUrl)
    } catch (err) {
        throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}"`)
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
