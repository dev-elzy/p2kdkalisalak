import { config } from "dotenv";
import { runSupabaseSql } from "./supabase-admin.js";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  console.log("🛠️ Normalisasi Data RT, RW dan Penetapan Meja RW di Database Supabase...");

  // 1. Bersihkan RT menjadi hanya angka 2 digit (misal: '01', '02', '03')
  await runSupabaseSql(`
    UPDATE pemilih 
    SET rt = lpad(regexp_replace(rt, '[^0-9]', '', 'g'), 2, '0');
  `);
  console.log("✅ Kolom RT dinormalisasi (contoh: '01', '02', '03').");

  // 2. Bersihkan RW menjadi hanya angka 2 digit (misal: '01', '02', ..., '13')
  await runSupabaseSql(`
    UPDATE pemilih 
    SET rw = lpad(regexp_replace(rw, '[^0-9]', '', 'g'), 2, '0');
  `);
  console.log("✅ Kolom RW dinormalisasi (contoh: '01', '02', ..., '13').");

  // 3. Ubah kolom TPS menjadi Meja RW XX
  await runSupabaseSql(`
    UPDATE pemilih 
    SET tps = 'Meja RW ' || rw,
        tps_id = 'rw-' || rw;
  `);
  console.log("✅ Kolom TPS pemilih diubah menjadi 'Meja RW XX' (tanpa istilah TPS).");

  // 4. Periksa sample 5 data
  const sample = await runSupabaseSql(`
    SELECT id, nama_lengkap, rt, rw, tps 
    FROM pemilih 
    ORDER BY id 
    LIMIT 5;
  `);
  console.log("Sample Data Pemilih Setelah Perbaikan:");
  console.table(sample.data);
}

main().catch(console.error);
