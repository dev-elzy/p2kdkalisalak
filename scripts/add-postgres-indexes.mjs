import { config } from "dotenv";
import { runSupabaseSql } from "./supabase-admin.js";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  console.log("⚡ Menambahkan Index PostgreSQL untuk Akselerasi Performa Supabase...");
  const sql = `
    CREATE INDEX IF NOT EXISTS idx_pemilih_nik ON pemilih(nik);
    CREATE INDEX IF NOT EXISTS idx_pemilih_tanggal_lahir ON pemilih(tanggal_lahir);
    CREATE INDEX IF NOT EXISTS idx_pemilih_rw ON pemilih(rw);
    CREATE INDEX IF NOT EXISTS idx_pemilih_tps ON pemilih(tps);
    CREATE INDEX IF NOT EXISTS idx_pemilih_status_aktif ON pemilih(status_aktif);
    CREATE INDEX IF NOT EXISTS idx_pemilih_nama_lengkap ON pemilih(nama_lengkap);
    CREATE INDEX IF NOT EXISTS idx_anggota_username ON anggota_p2kd(username);
    CREATE INDEX IF NOT EXISTS idx_aduan_created_at ON aduan_pemilih(created_at DESC);
  `;

  const res = await runSupabaseSql(sql);
  console.log("✅ Indeks berhasil dibuat:", res);
}

main().catch(console.error);
