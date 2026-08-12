const { createClient } = require("@supabase/supabase-js");

// Prefer the service role key for server-side operations (webhooks, admin tasks).
// Fall back to the publishable/anon key if the service role key is not provided
// (useful for local dev where only anon key may be available).
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(process.env.SUPABASE_URL, supabaseKey);

module.exports = supabase;
