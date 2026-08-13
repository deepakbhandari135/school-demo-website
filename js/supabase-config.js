// ============================================================
// Supabase connection settings
// ------------------------------------------------------------
// 1. Go to your Supabase project -> Settings -> API
// 2. Copy "Project URL" and "anon public" key below
// 3. Never put your service_role key here — only the anon key,
//    it is safe to use in frontend code together with Row Level
//    Security (RLS) policies (see supabase-schema.sql)
// ============================================================
const SUPABASE_URL = "https://https://oalmpbbdgdpvurjrlxty.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JPfOTdJRiZhOoAiohFo8NA_iYKOaCFT;

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
