// supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://sjlspdslirvaomhhjlhx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbHNwZHNsaXJ2YW9taGhqbGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjEyNDEsImV4cCI6MjA3ODkzNzI0MX0.IL80coGTsmofsGL03ObTNRPSuhHkh8Gft74Mzlt5Mg4"
);