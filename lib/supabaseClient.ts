import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ddhojupqexdhpvzzvznr.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkaG9qdXBxZXhkaHB2enp2em5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxOTY2NzQsImV4cCI6MjA1Mjc3MjY3NH0.1PJF-tKAjNzvUgBP6OwbT9xAzO7fiIymu2hKwMXYhSw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Ensures session persists across reloads
    detectSessionInUrl: true, // Handles session detection in the URL
  },
});
