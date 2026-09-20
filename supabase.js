// JNV Result Manager - Supabase Connection

const SUPABASE_URL = "https://pzvnavadhgqfceaypjqb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_6HEYEQUPZ9aho1jcY1sLoQ_50aRqNsV";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);