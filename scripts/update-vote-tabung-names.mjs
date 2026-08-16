import { config } from "dotenv";
import { runSupabaseSql } from "./supabase-admin.js";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  console.log("🗳️ Memperbarui nama pada tps_vote_counts menjadi Tabung Suara...");
  await runSupabaseSql(`
    UPDATE tps_vote_counts 
    SET nama_tps = 'Tabung Suara ' || nomor_tps;
  `);
  console.log("✅ Berhasil diperbarui.");
}

main().catch(console.error);
