import "../../../loadEnvironment.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const bucket = supabase.storage.from("lingo-deck");

export default bucket;
