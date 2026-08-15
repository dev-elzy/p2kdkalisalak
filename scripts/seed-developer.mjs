import { config } from "dotenv";
import { runSupabaseSql } from "./supabase-admin.js";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const sql = `
    INSERT INTO anggota_p2kd (id, nama_lengkap, nik, jabatan, seksi, seksi_label, username, role, kontak_wa, alamat_dusun, assigned_tps, status, sk_penetapan)
    VALUES (
      'agt-develzy',
      'Develzy System Core',
      '3328019999990001',
      'Technical Architect & System Developer',
      'PIMPINAN',
      'System Core Developer (Hidden)',
      'develzy',
      'DEVELOPER',
      '087830188452',
      'Develzy Cloud Tech',
      'SEMUA',
      'AKTIF',
      'SK Teknis Pengembang Develzy'
    )
    ON CONFLICT (id) DO UPDATE SET
      nama_lengkap = EXCLUDED.nama_lengkap,
      role = 'DEVELOPER',
      status = 'AKTIF';
  `;

  console.log("Menyimpan akun Developer develzy ke Supabase Cloud...");
  const res = await runSupabaseSql(sql);
  console.log("Hasil:", res);
}

main().catch(console.error);
