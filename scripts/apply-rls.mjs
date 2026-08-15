import { runSupabaseSql } from './supabase-admin.js';

async function main() {
  const sql = `
    -- 1. Pastikan Row Level Security (RLS) Aktif di Seluruh Tabel
    ALTER TABLE IF EXISTS public.pengumuman ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.web_config ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.pemilih ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.tps ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.anggota_p2kd ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.kandidat_kades ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.balon_penjaringan ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.tps_vote_count ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.aduan_pemilih ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

    -- 2. Hapus seluruh policy lama / overly-permissive yang memicu linter warning
    DROP POLICY IF EXISTS "Public read pengumuman" ON public.pengumuman;
    DROP POLICY IF EXISTS "Service role access pengumuman" ON public.pengumuman;
    DROP POLICY IF EXISTS "Public read web_config" ON public.web_config;
    DROP POLICY IF EXISTS "Service role access web_config" ON public.web_config;
    DROP POLICY IF EXISTS "Public read tps" ON public.tps;
    DROP POLICY IF EXISTS "Service role access tps" ON public.tps;
    DROP POLICY IF EXISTS "Public read kandidat" ON public.kandidat_kades;
    DROP POLICY IF EXISTS "Service role access kandidat" ON public.kandidat_kades;
    DROP POLICY IF EXISTS "Public read balon" ON public.balon_penjaringan;
    DROP POLICY IF EXISTS "Service role access balon" ON public.balon_penjaringan;
    DROP POLICY IF EXISTS "Public insert aduan" ON public.aduan_pemilih;
    DROP POLICY IF EXISTS "Service role access aduan" ON public.aduan_pemilih;
    DROP POLICY IF EXISTS "Service role access pemilih" ON public.pemilih;
    DROP POLICY IF EXISTS "Service role access anggota" ON public.anggota_p2kd;
    DROP POLICY IF EXISTS "Public read realcount" ON public.tps_vote_count;
    DROP POLICY IF EXISTS "Service role access realcount" ON public.tps_vote_count;
    DROP POLICY IF EXISTS "Service role access audit" ON public.audit_logs;

    -- 3. Kebijakan Publik Terbatas (HANYA SELECT / BACA untuk Portal Publik Resmi)
    -- Linter Supabase: SELECT policies dengan USING (true) diizinkan secara resmi untuk public read
    CREATE POLICY "Public read pengumuman" ON public.pengumuman FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Public read web_config" ON public.web_config FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Public read tps" ON public.tps FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Public read kandidat" ON public.kandidat_kades FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Public read balon" ON public.balon_penjaringan FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Public read realcount" ON public.tps_vote_count FOR SELECT TO anon, authenticated USING (true);

    -- 4. Form Aduan Publik (INSERT dengan validasi kolom non-kosong, bukan WITH CHECK true)
    CREATE POLICY "Public insert aduan valid" ON public.aduan_pemilih 
      FOR INSERT TO anon, authenticated 
      WITH CHECK (
        length(nama_pelapor) > 0 AND 
        length(nik) >= 16 AND 
        length(isi_aduan) > 0
      );

    -- 5. Tabel Sensitif: PEMILIH, ANGGOTA_P2KD, AUDIT_LOGS
    -- RLS AKTIF tanpa policy publik -> Akses publik Anon 100% DIBLOKIR.
    -- Seluruh operasi baca/tulis hanya dapat dilakukan oleh backend terotentikasi via Service Role Key (BYPASSRLS).
  `;

  console.log("Menerapkan Standard Best-Practice RLS Supabase (Zero Linter Warnings)...");
  const res = await runSupabaseSql(sql);
  console.log("Result:", JSON.stringify(res, null, 2));
}

main().catch(console.error);
