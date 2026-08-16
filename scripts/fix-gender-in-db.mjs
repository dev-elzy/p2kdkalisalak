import { config } from "dotenv";
import { runSupabaseSql } from "./supabase-admin.js";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  console.log("🚻 Menyelaraskan Data Jenis Kelamin (L / P) di Database Supabase...");

  // Update to standard 'L' and 'P'
  await runSupabaseSql(`
    UPDATE pemilih 
    SET jenis_kelamin = CASE 
      WHEN upper(jenis_kelamin) LIKE 'L%' THEN 'L'
      ELSE 'P'
    END;
  `);

  const countRes = await runSupabaseSql(`
    SELECT jenis_kelamin, count(*) as total 
    FROM pemilih 
    GROUP BY jenis_kelamin;
  `);

  console.log("✅ Rekapitulasi Jenis Kelamin Database Supabase:");
  console.table(countRes.data);
}

main().catch(console.error);
