// ============================================================
// KONFIGURASI SUPABASE
// ============================================================
// Ganti dua nilai di bawah ini dengan punya kamu.
// Cara mendapatkannya: buka project Supabase kamu -> Project Settings -> API
//   - SUPABASE_URL   = "Project URL"
//   - SUPABASE_ANON_KEY = "anon public" key
// ============================================================

const SUPABASE_URL = "https://cpspxozqwmrvzzzkepxc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_pIiiAZaG7EDp1Hhbt7mWwA_Wtia-ijC";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
