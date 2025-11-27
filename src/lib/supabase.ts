import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sjlspdslirvaomhhjlhx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbHNwZHNsaXJ2YW9taGhqbGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjEyNDEsImV4cCI6MjA3ODkzNzI0MX0.IL80coGTsmofsGL03ObTNRPSuhHkh8Gft74Mzlt5Mg4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
