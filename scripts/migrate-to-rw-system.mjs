import { config } from "dotenv";
import { runSupabaseSql } from "./supabase-admin.js";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  console.log("==================================================");
  console.log("🏛️ MIGRASI SISTEM KE STRUKTUR WILAYAH RW (13 RW)");
  console.log("==================================================");

  // 1. Update kolom TPS di tabel pemilih menjadi Wilayah RW
  console.log("\n1. Memperbarui kolom penugasan pemilih menjadi Wilayah RW...");
  await runSupabaseSql(`
    UPDATE pemilih 
    SET tps = rw, 
        tps_id = 'rw-' || lpad(replace(replace(rw, 'RW ', ''), 'rw ', ''), 2, '0');
  `);
  console.log("✅ Data pemilih berhasil diarahkan ke Meja RW masing-masing.");

  // 2. Kosongkan & Isi ulang tabel TPS menjadi 13 Meja Pendaftaran RW
  console.log("\n2. Memperbarui master Meja Pendaftaran / Tabung RW (13 RW)...");
  await runSupabaseSql(`DELETE FROM tps;`);

  const tpsTuples = [];
  for (let i = 1; i <= 13; i++) {
    const nomor = String(i).padStart(2, "0");
    const id = `rw-${nomor}`;
    const kode = `RW-${nomor}`;
    const nama = `Wilayah RW ${nomor}`;
    const namaTabung = `Meja Pendaftaran RW ${nomor}`;
    const lokasi = `Pusat Lapangan Desa Kalisalak (Zona RW ${nomor})`;
    const alamat = `Lapangan Desa Kalisalak, Kec. Margasari, Kab. Tegal`;

    tpsTuples.push(`(
      '${id}', '${kode}', '${nomor}', '${nama}', '${namaTabung}',
      '${lokasi}', '${alamat}', 'RT 01, RT 02, RT 03', 'RW ${nomor}',
      850, 'AKTIF'
    )`);
  }

  const insertTpsSql = `
    INSERT INTO tps (id, kode_tps, nomor_tps, nama_tps, nama_tabung, lokasi, alamat, rt, rw, kuota_maksimal, status)
    VALUES ${tpsTuples.join(",\n")};
  `;
  await runSupabaseSql(insertTpsSql);
  console.log("✅ 13 Meja Pendaftaran / Wilayah RW berhasil disimpan.");

  // 3. Perbarui tabel tps_vote_counts untuk 13 RW
  console.log("\n3. Menyinkronkan rekapitulasi DPT per Wilayah RW ke tps_vote_counts...");
  await runSupabaseSql(`DELETE FROM tps_vote_counts;`);

  const rwCountsRes = await runSupabaseSql(`
    SELECT rw, count(*) as total_dpt,
           sum(case when jenis_kelamin = 'Laki-laki' then 1 else 0 end) as laki,
           sum(case when jenis_kelamin = 'Perempuan' then 1 else 0 end) as perempuan
    FROM pemilih
    GROUP BY rw
    ORDER BY rw;
  `);

  console.log("Rekap DPT per Wilayah RW:");
  console.table(rwCountsRes.data);

  for (const r of rwCountsRes.data) {
    const nomor = r.rw.replace(/[^0-9]/g, "").padStart(2, "0");
    const id = `vote-rw-${nomor}`;
    const tpsId = `rw-${nomor}`;
    const namaTps = `Meja Pendaftaran RW ${nomor}`;
    const totalDpt = parseInt(r.total_dpt, 10);

    const insertVoteSql = `
      INSERT INTO tps_vote_counts (id, tps_id, nomor_tps, nama_tps, total_dpt, suara_masuk, suara_sah, suara_tidak_sah, status_pleno_tps)
      VALUES ('${id}', '${tpsId}', '${nomor}', '${namaTps}', ${totalDpt}, 0, 0, 0, 'BELUM');
    `;
    await runSupabaseSql(insertVoteSql);
  }

  console.log("✅ Rekapitulasi 13 Wilayah RW berhasil disinkronkan.");
}

main().catch(console.error);
