import { config } from "dotenv";
import { runSupabaseSql } from "./supabase-admin.js";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  console.log("🛠️ Menambahkan Kolom 'tahap' (DPS / DPT) ke Tabel 'pemilih' di Supabase...");

  await runSupabaseSql(`
    ALTER TABLE pemilih 
    ADD COLUMN IF NOT EXISTS tahap character varying(20) DEFAULT 'DPS';
  `);

  // Default all existing unverified to DPS
  await runSupabaseSql(`
    UPDATE pemilih 
    SET tahap = 'DPS' 
    WHERE tahap IS NULL;
  `);

  // Add index for fast querying
  await runSupabaseSql(`
    CREATE INDEX IF NOT EXISTS idx_pemilih_tahap ON pemilih(tahap);
  `);

  const res = await runSupabaseSql(`
    SELECT tahap, count(*) as total 
    FROM pemilih 
    GROUP BY tahap;
  `);

  console.log("✅ Struktur Kolom 'tahap' Berhasil Ditambahkan:");
  console.table(res.data);
}

main().catch(console.error);
