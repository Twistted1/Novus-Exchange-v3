import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jvbucspwcjahqpoxskvr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pWKg-jUXV_rTWksBvDnkhw_DIxBPyAS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
