// JNV Result Manager - Supabase Connection

const SUPABASE_URL = "https://pzvnavadhgqfceaypjqb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_89GpCTlNtJKkId9HSoqEfg_BGIXkLAM";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);