import { config } from "dotenv";
import { runSupabaseSql } from "./supabase-admin.js";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  // 1. Verify Count in Table Pemilih
  const countRes = await runSupabaseSql(`SELECT count(*) as total_pemilih FROM pemilih;`);
  console.log("Total pemilih di Supabase:", countRes.data);

  // 2. Count per TPS
  const perTpsRes = await runSupabaseSql(`
    SELECT tps, count(*) as total_dpt,
           sum(case when jenis_kelamin = 'Laki-laki' then 1 else 0 end) as laki,
           sum(case when jenis_kelamin = 'Perempuan' then 1 else 0 end) as perempuan
    FROM pemilih
    GROUP BY tps
    ORDER BY tps;
  `);
  console.log("Rekap Pemilih per TPS:");
  console.table(perTpsRes.data);

  // 3. Upsert into tps_vote_counts
  console.log("Menyinkronkan total DPT ke tabel tps_vote_counts...");
  for (const t of perTpsRes.data) {
    const nomor = t.tps.replace(/[^0-9]/g, "").padStart(2, "0");
    const tpsId = `tps-${parseInt(nomor, 10)}`;
    const namaTps = `TPS ${nomor}`;
    const totalDpt = parseInt(t.total_dpt, 10);

    const upsertSql = `
      INSERT INTO tps_vote_counts (id, tps_id, nomor_tps, nama_tps, total_dpt, suara_masuk, suara_sah, suara_tidak_sah, status_pleno_tps)
      VALUES ('vote-${tpsId}', '${tpsId}', '${nomor}', '${namaTps}', ${totalDpt}, 0, 0, 0, 'BELUM')
      ON CONFLICT (id) DO UPDATE SET
        total_dpt = EXCLUDED.total_dpt,
        nama_tps = EXCLUDED.nama_tps;
    `;
    await runSupabaseSql(upsertSql);
  }

  console.log("✅ tps_vote_counts berhasil disinkronkan untuk seluruh 14 TPS!");
}

main().catch(console.error);
