import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jvbucspwcjahqpoxskvr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YnVjc3B3Y2phaHFwb3hza3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDM5MjksImV4cCI6MjA4NDUxOTkyOX0.X5pA6-DsflBoLEtwSj3N1oISjg_qYCKt2OajMNx6PSU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
