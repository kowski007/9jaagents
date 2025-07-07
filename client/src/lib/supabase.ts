import { createClient } from '@supabase/supabase-js';

// Add your Supabase project URL and anon/public key here
export const SUPABASE_URL = "https://zjnwdmdzbucokklcgpcr.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbndkbWR6YnVjb2trbGNncGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5ODgyODUsImV4cCI6MjA2NTU2NDI4NX0.le6G2-DHVkZovfQfwQfLp6Oa6W7LKj0BuXPZIVEx8tw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
