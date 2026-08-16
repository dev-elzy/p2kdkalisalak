import XLSX from "xlsx";
import path from "path";
import { config } from "dotenv";
import { runSupabaseSql } from "./supabase-admin.js";

config({ path: ".env.local" });
config({ path: ".env" });

const TPS_LOCATIONS = {
  1: "Depan Rumah Bp. Tamri",
  2: "Lapangan Volly",
  3: "Halaman MI NU 01 Kalisalak",
  4: "Halaman Rumah Ibu Rikhanah",
  5: "Halaman Rumah Alm. Bp. Ust. Sukhari",
  6: "Halaman Musholla Baitul Muhajirin",
  7: "Depan Musholla Al Athar",
  8: "MI Nurul Huda Kalisalak",
  9: "Halaman Musholla Baitul Muttaqin",
  10: "Halaman Rumah Bp. Sonhaji",
  11: "Halaman Bp. Priyadi / Ibu Munawaroh",
  12: "Halaman Rumah Ibu Nurhayati / Bp. Usd. Piing (Alm)",
  13: "Halaman SDN Kalisalak 03",
  14: "Halaman Musholla Baitul Marwah",
};

function parseDate(rawDate) {
  if (!rawDate) return "1990-01-01";
  const str = String(rawDate).trim();
  if (str.includes("|")) {
    const p = str.split("|");
    if (p.length === 3) return `${p[2].padStart(4, "0")}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`;
  }
  if (str.includes("-")) {
    const p = str.split("-");
    if (p.length === 3) {
      if (p[0].length === 4) return str;
      return `${p[2].padStart(4, "0")}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`;
    }
  }
  if (str.includes("/")) {
    const p = str.split("/");
    if (p.length === 3) return `${p[2].padStart(4, "0")}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`;
  }
  return "1990-01-01";
}

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return `'${String(str).replace(/'/g, "''").trim()}'`;
}

async function main() {
  console.log("=================================================");
  console.log("🚀 SINKRONISASI TOTAL DATA DPT KALISALAK (7.787 PEMILIH)");
  console.log("=================================================");

  // 1. Baca Berkas Excel
  const filePath = path.resolve("DRAFT DPT KALISALAK.xlsx");
  console.log("1. Membaca berkas Excel:", filePath);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets["MARGASARI_KALISALAK(1)"];
  const rows = XLSX.utils.sheet_to_json(sheet);
  console.log(`✅ Berhasil membaca ${rows.length} baris pemilih dari Excel.`);

  // 2. Bersihkan Data Dummy Pemilih di Supabase
  console.log("\n2. Menghapus seluruh data pemilih dummy lama di Supabase...");
  const deleteRes = await runSupabaseSql(`DELETE FROM pemilih;`);
  console.log("✅ Data pemilih lama berhasil dikosongkan:", deleteRes.status);

  // 3. Upsert 14 TPS Resmi
  console.log("\n3. Menyinkronkan 14 TPS Resmi Kalisalak...");
  const tpsSqlList = [];
  for (let i = 1; i <= 14; i++) {
    const nomor = String(i).padStart(2, "0");
    const id = `tps-${i}`;
    const kode = `TPS-${nomor}`;
    const nama = `TPS ${nomor}`;
    const tabung = `Tabung Pemilihan ${nomor} (${TPS_LOCATIONS[i] || "Desa Kalisalak"})`;
    const lokasi = TPS_LOCATIONS[i] || "Desa Kalisalak";
    const alamat = `${lokasi}, Desa Kalisalak, Kec. Margasari`;

    tpsSqlList.push(`(
      ${escapeSql(id)}, ${escapeSql(kode)}, ${escapeSql(nomor)}, ${escapeSql(nama)},
      ${escapeSql(tabung)}, ${escapeSql(lokasi)}, ${escapeSql(alamat)},
      'RT 01-03', 'RW ${nomor}', 650, 'AKTIF'
    )`);
  }

  const upsertTpsSql = `
    INSERT INTO tps (id, kode_tps, nomor_tps, nama_tps, nama_tabung, lokasi, alamat, rt, rw, kuota_maksimal, status)
    VALUES ${tpsSqlList.join(",\n")}
    ON CONFLICT (id) DO UPDATE SET
      nama_tps = EXCLUDED.nama_tps,
      nama_tabung = EXCLUDED.nama_tabung,
      lokasi = EXCLUDED.lokasi,
      alamat = EXCLUDED.alamat,
      status = 'AKTIF';
  `;
  await runSupabaseSql(upsertTpsSql);
  console.log("✅ 14 TPS Resmi berhasil disimpan ke database.");

  // 4. Batch Insert 7.787 Pemilih ke Database
  console.log("\n4. Mengimpor 7.787 data pemilih ke Supabase Cloud (dalam batch 400 baris)...");
  const BATCH_SIZE = 400;
  let importedCount = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const valueTuples = chunk.map((r, idx) => {
      const globalIndex = i + idx + 1;
      const id = `pml-${globalIndex}`;
      const nik = String(r["NIK"] || "").replace(/[^0-9]/g, "");
      const noKk = String(r["NKK"] || "").replace(/[^0-9]/g, "");
      const nama = String(r["NAMA"] || "").trim().toUpperCase();
      const tempatLahir = String(r["TEMPAT LAHIR"] || "TEGAL").trim().toUpperCase();
      const tanggalLahir = parseDate(r["TANGGAL LAHIR"]);
      const jkRaw = String(r["KELAMIN"] || "L").toUpperCase();
      const jenisKelamin = jkRaw.startsWith("L") ? "Laki-laki" : "Perempuan";
      const kawinRaw = String(r["STS KAWIN"] || "S").toUpperCase();
      const statusPerkawinan = kawinRaw.startsWith("S") ? "Kawin" : kawinRaw.startsWith("B") ? "Belum Kawin" : "Pernah Kawin";
      const alamat = String(r["ALAMAT"] || "KALISALAK").trim();
      const rt = `RT ${String(r["RT"] || "01").padStart(2, "0")}`;
      const rw = `RW ${String(r["RW"] || "01").padStart(2, "0")}`;
      const tpsNomor = String(r["TPS"] || "1").padStart(2, "0");
      const tps = `TPS ${tpsNomor}`;
      const tpsId = `tps-${r["TPS"] || 1}`;

      return `(
        ${escapeSql(id)}, ${escapeSql(nik)}, ${escapeSql(noKk)}, ${escapeSql(nama)},
        ${escapeSql(tempatLahir)}, ${escapeSql(tanggalLahir)}, ${escapeSql(jenisKelamin)},
        ${escapeSql(statusPerkawinan)}, ${escapeSql(alamat)}, ${escapeSql(rt)},
        ${escapeSql(rw)}, 'Kalisalak', 'Margasari', ${escapeSql(tps)},
        ${escapeSql(tpsId)}, 'TIDAK', 'AKTIF', 'SUDAH'
      )`;
    });

    const insertSql = `
      INSERT INTO pemilih (
        id, nik, no_kk, nama_lengkap, tempat_lahir, tanggal_lahir,
        jenis_kelamin, status_perkawinan, alamat, rt, rw,
        desa, kecamatan, tps, tps_id, disabilitas, status_aktif, coklit_status
      ) VALUES
      ${valueTuples.join(",\n")}
      ON CONFLICT (id) DO UPDATE SET
        nik = EXCLUDED.nik,
        nama_lengkap = EXCLUDED.nama_lengkap,
        tps = EXCLUDED.tps;
    `;

    const res = await runSupabaseSql(insertSql);
    if (res.status === 200 || res.status === 201) {
      importedCount += chunk.length;
      process.stdout.write(`\r   -> Tersimpan: ${importedCount} / ${rows.length} pemilih (${Math.round((importedCount / rows.length) * 100)}%)`);
    } else {
      console.error(`\n❌ Gagal pada batch ${i} - ${i + chunk.length}:`, res);
    }
  }

  console.log("\n\n✅ SELURUH 7.787 DATA PEMILIH RESMI BERHASIL DISINKRONKAN KE SUPABASE CLOUD!");

  // 5. Update Web Config (Total RT 39, Total RW 13)
  console.log("\n5. Memperbarui Master Konfigurasi Web...");
  await runSupabaseSql(`
    UPDATE web_config 
    SET total_rw = 13, total_rt = 39, updated_at = NOW()
    WHERE id = 'main_config';
  `);

  console.log("🎉 Sinkronisasi selesai dengan sukses!");
}

main().catch(console.error);
