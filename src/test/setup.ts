import '@testing-library/jest-dom'

// Platzhalter-Werte, damit Module, die die Supabase-Env-Validierung beim Import
// auslösen, in der Testumgebung geladen werden können.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'sb_publishable_test'
