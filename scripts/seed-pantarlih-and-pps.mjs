import { config } from "dotenv";
import { runSupabaseSql } from "./supabase-admin.js";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const pantarlihAccounts = [];
  const ppsAccounts = [];

  for (let i = 1; i <= 13; i++) {
    const rwNum = i.toString().padStart(2, "0");

    // 1. Pantarlih Account (Seksi 1: Pemutakhiran Data Pemilih & Coklit)
    pantarlihAccounts.push({
      id: `agt-pantarlih-${rwNum}`,
      nama_lengkap: `Petugas Pantarlih RW ${rwNum}`,
      nik: `332801010100${rwNum}01`,
      jabatan: `Koordinator Pantarlih RW ${rwNum}`,
      seksi: "SEKSI_PEMILIH",
      seksi_label: "Seksi 1: Pemutakhiran Data Pemilih",
      username: `pantarlih${rwNum}`,
      role: "PANTARLIH_LAPANGAN",
      kontak_wa: `0878301880${rwNum}`,
      alamat_dusun: `Wilayah RW ${rwNum}, Desa Kalisalak`,
      assigned_tps: `Wilayah RW ${rwNum}`,
      status: "AKTIF",
      sk_penetapan: `SK/P2KD/PANTARLIH/RW-${rwNum}/2026`,
      password_hash: "p2kd12345",
    });

    // 2. PPS Account (Seksi 4: Pemungutan & Penghitungan Suara)
    ppsAccounts.push({
      id: `agt-pps-${rwNum}`,
      nama_lengkap: `Petugas KPPS Meja RW ${rwNum}`,
      nik: `332801010100${rwNum}02`,
      jabatan: `Ketua KPPS Meja RW ${rwNum}`,
      seksi: "SEKSI_PUNGUT_HITUNG",
      seksi_label: "Seksi 4: Pemungutan & Penghitungan Suara",
      username: `pps${rwNum}`,
      role: "PETUGAS_TPS",
      kontak_wa: `0878301890${rwNum}`,
      alamat_dusun: `Meja RW ${rwNum} - Lapangan Desa Kalisalak`,
      assigned_tps: `Meja RW ${rwNum}`,
      status: "AKTIF",
      sk_penetapan: `SK/P2KD/KPPS/MEJA-${rwNum}/2026`,
      password_hash: "p2kd12345",
    });
  }

  const allAccounts = [...pantarlihAccounts, ...ppsAccounts];

  console.log(`Menyiapkan ${allAccounts.length} akun petugas (13 Pantarlih + 13 PPS) ke Supabase...`);

  // Pastikan kolom password_hash ada
  await runSupabaseSql(`ALTER TABLE anggota_p2kd ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT 'p2kd12345';`);

  const valuesSql = allAccounts
    .map(
      (a) => `(
      '${a.id}',
      '${a.nama_lengkap}',
      '${a.nik}',
      '${a.jabatan}',
      '${a.seksi}',
      '${a.seksi_label}',
      '${a.username}',
      '${a.role}',
      '${a.kontak_wa}',
      '${a.alamat_dusun}',
      '${a.assigned_tps}',
      '${a.status}',
      '${a.sk_penetapan}',
      '${a.password_hash}'
    )`
    )
    .join(",\n");

  const sql = `
    INSERT INTO anggota_p2kd (
      id, nama_lengkap, nik, jabatan, seksi, seksi_label, username, role, kontak_wa, alamat_dusun, assigned_tps, status, sk_penetapan, password_hash
    ) VALUES 
    ${valuesSql}
    ON CONFLICT (id) DO UPDATE SET
      nama_lengkap = EXCLUDED.nama_lengkap,
      jabatan = EXCLUDED.jabatan,
      seksi = EXCLUDED.seksi,
      seksi_label = EXCLUDED.seksi_label,
      username = EXCLUDED.username,
      role = EXCLUDED.role,
      assigned_tps = EXCLUDED.assigned_tps,
      status = 'AKTIF',
      password_hash = COALESCE(anggota_p2kd.password_hash, EXCLUDED.password_hash);
  `;

  const res = await runSupabaseSql(sql);
  console.log("Hasil penyisipan akun petugas:", res);
}

main().catch(console.error);
