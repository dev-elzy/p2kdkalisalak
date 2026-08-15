import { runSupabaseSql } from './supabase-admin.js';

async function main() {
  const sql = `
    -- 1. Kosongkan Data Pemilih (DPT/DPS/Coklit)
    TRUNCATE TABLE pemilih CASCADE;

    -- 2. Kosongkan Aduan Masyarakat
    TRUNCATE TABLE aduan_pemilih CASCADE;

    -- 3. Kosongkan Pendaftaran Bakal Calon Kades
    TRUNCATE TABLE balon_penjaringan CASCADE;

    -- 4. Kosongkan Kandidat Calon Kades
    TRUNCATE TABLE kandidat_kades CASCADE;

    -- 5. Kosongkan Riwayat Audit Log
    TRUNCATE TABLE audit_logs CASCADE;

    -- 6. Reset Perolehan Suara TPS ke 0
    UPDATE tps_vote_count SET
      suara_kandidat = '{}'::jsonb,
      suara_sah = 0,
      suara_tidak_sah = 0,
      suara_masuk = 0,
      status_pleno_tps = 'BELUM',
      waktu_input = NULL,
      petugas_input = NULL;

    -- 7. Bersihkan Anggota P2KD selain Superadmin Utama
    DELETE FROM anggota_p2kd WHERE username NOT IN ('admin_kalisalak');

    -- Pastikan Akun Superadmin Utama siap untuk login & input manual
    INSERT INTO anggota_p2kd (id, nama_lengkap, nik, jabatan, seksi, seksi_label, username, role, kontak_wa, alamat_dusun, assigned_tps, status, sk_penetapan)
    VALUES ('agt-superadmin', 'Ahmad Subagyo, S.Pd', '3328011205840001', 'Ketua Panitia P2KD', 'PIMPINAN', 'Pimpinan P2KD (Ketua/Sekretaris/Bendahara)', 'admin_kalisalak', 'SUPER_ADMIN', '081234567890', 'Dusun Krajan I', 'SEMUA', 'AKTIF', 'Keputusan BPD No. 01/BPD-KLS/VII/2026')
    ON CONFLICT (id) DO UPDATE SET
      nama_lengkap = EXCLUDED.nama_lengkap,
      role = 'SUPER_ADMIN',
      status = 'AKTIF';
  `;

  console.log("Menjalankan pengosongan database Supabase Cloud...");
  const res = await runSupabaseSql(sql);
  console.log("Hasil Pengosongan Database:", res);
}

main().catch(console.error);
