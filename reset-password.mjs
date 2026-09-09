import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://kfqhfoliaiejxjwdxufm.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const { error } = await supabase.auth.admin.updateUserById(
  "8f590354-5475-47ef-b943-886e8b018e88",
  {
    password: "OSMAN123",
  }
);

if (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
}

console.log("Contraseña actualizada correctamente.");
