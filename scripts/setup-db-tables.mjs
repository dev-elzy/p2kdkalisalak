import { runSupabaseSql } from './supabase-admin.js';

async function main() {
  const sql = `
    -- 1. Tabel Pengumuman Publik P2KD
    CREATE TABLE IF NOT EXISTS pengumuman (
      id TEXT PRIMARY KEY,
      nomor TEXT NOT NULL,
      judul TEXT NOT NULL,
      kategori TEXT NOT NULL,
      tanggal TEXT NOT NULL,
      ringkasan TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 2. Tabel Web Config & Pengaturan Publik
    CREATE TABLE IF NOT EXISTS web_config (
      id TEXT PRIMARY KEY,
      nama_desa TEXT NOT NULL DEFAULT 'Kalisalak',
      kecamatan TEXT NOT NULL DEFAULT 'Margasari',
      kabupaten TEXT NOT NULL DEFAULT 'Tegal',
      provinsi TEXT NOT NULL DEFAULT 'Jawa Tengah',
      lokasi_utama TEXT NOT NULL DEFAULT 'Lapangan Desa Kalisalak',
      lokasi_maps_url TEXT NOT NULL DEFAULT 'https://www.google.com/maps/search/?api=1&query=Lapangan+Desa+Kalisalak+Margasari+Tegal',
      periode_masa_bakti TEXT NOT NULL DEFAULT '2027 – 2035',
      hari_h_tanggal TEXT NOT NULL DEFAULT 'Rabu, 3 Februari 2027',
      running_text TEXT NOT NULL DEFAULT 'Pemberitahuan Resmi P2KD: Seluruh rangkaian pemungutan dan penghitungan suara Pilkades Desa Kalisalak dipusatkan di LAPANGAN DESA KALISALAK pada hari Rabu, 3 Februari 2027. Mohon membawa KTP-el dan Undangan Memilih.',
      is_running_text_active BOOLEAN NOT NULL DEFAULT TRUE,
      is_cek_hak_pilih_open BOOLEAN NOT NULL DEFAULT TRUE,
      is_profil_calon_visible BOOLEAN NOT NULL DEFAULT TRUE,
      is_real_count_public BOOLEAN NOT NULL DEFAULT FALSE,
      is_aduan_open BOOLEAN NOT NULL DEFAULT TRUE,
      kontak_wa_p2kd TEXT NOT NULL DEFAULT '081234567890',
      jam_layanan TEXT NOT NULL DEFAULT '08.00 - 15.00 WIB (Senin - Sabtu)',
      alamat_sekretariat TEXT NOT NULL DEFAULT 'Kantor Balai Desa Kalisalak, Jl. Raya Kalisalak No. 01, Kec. Margasari, Kab. Tegal',
      total_rw INT NOT NULL DEFAULT 13,
      total_rt INT NOT NULL DEFAULT 39,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 3. Update / Pastikan Tabel TPS / Tabung Pemilihan
    CREATE TABLE IF NOT EXISTS tps (
      id TEXT PRIMARY KEY,
      kode_tps TEXT NOT NULL,
      nomor_tps TEXT NOT NULL,
      nama_tps TEXT NOT NULL,
      nama_tabung TEXT,
      lokasi TEXT NOT NULL,
      alamat TEXT NOT NULL,
      rt TEXT,
      rw TEXT,
      kuota_maksimal INT NOT NULL DEFAULT 600,
      status TEXT NOT NULL DEFAULT 'AKTIF',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE tps ADD COLUMN IF NOT EXISTS nama_tabung TEXT;

    -- 4. Seed Web Config default bila belum ada
    INSERT INTO web_config (
      id, nama_desa, kecamatan, kabupaten, provinsi, lokasi_utama, lokasi_maps_url,
      periode_masa_bakti, hari_h_tanggal, running_text, is_running_text_active,
      is_cek_hak_pilih_open, is_profil_calon_visible, is_real_count_public, is_aduan_open,
      kontak_wa_p2kd, jam_layanan, alamat_sekretariat, total_rw, total_rt
    ) VALUES (
      'main_config', 'Kalisalak', 'Margasari', 'Tegal', 'Jawa Tengah',
      'Lapangan Desa Kalisalak', 'https://www.google.com/maps/search/?api=1&query=Lapangan+Desa+Kalisalak+Margasari+Tegal',
      '2027 – 2035', 'Rabu, 3 Februari 2027',
      'Pemberitahuan Resmi P2KD: Seluruh rangkaian pemungutan dan penghitungan suara Pilkades Desa Kalisalak dipusatkan di LAPANGAN DESA KALISALAK pada hari Rabu, 3 Februari 2027. Mohon membawa KTP-el dan Undangan Memilih.',
      TRUE, TRUE, TRUE, FALSE, TRUE,
      '081234567890', '08.00 - 15.00 WIB (Senin - Sabtu)',
      'Kantor Balai Desa Kalisalak, Jl. Raya Kalisalak No. 01, Kec. Margasari, Kab. Tegal',
      13, 39
    ) ON CONFLICT (id) DO NOTHING;

    -- 5. Seed Pengumuman Resmi ke Database
    INSERT INTO pengumuman (id, nomor, judul, kategori, tanggal, ringkasan, file_url, file_name, file_size)
    VALUES
    (
      'ann-1',
      '100.3.3.2/713 TAHUN 2026',
      'Keputusan Bupati Tegal tentang Hari dan Tanggal, Daftar Desa, serta Tahapan Pelaksanaan Pilkades Serentak Gelombang I Tahun 2027',
      'KEPUTUSAN BUPATI',
      '4 Agustus 2026',
      'Pedoman resmi tahapan, jadwal, dan daftar 119 desa peserta Pilkades Serentak se-Kabupaten Tegal, termasuk Desa Kalisalak (Kec. Margasari) dengan hari H pencoblosan Rabu, 3 Februari 2027.',
      '/docs/SK_Bupati_Tegal_Nomor_100.3.3.2_713_Tahun_2026.pdf',
      'SK_Bupati_Tegal_Nomor_100.3.3.2_713_Tahun_2026.pdf',
      '4.8 MB (PDF Asli)'
    ),
    (
      'ann-2',
      '16 TAHUN 2026',
      'Peraturan Pemerintah Republik Indonesia tentang Peraturan Pelaksanaan UU No. 6 Tahun 2014 tentang Desa',
      'PERATURAN PEMERINTAH',
      '27 Maret 2026',
      'Regulasi nasional tata cara pemilihan kepala desa (Pasal 38 s/d 50), ketentuan masa jabatan Kepala Desa 8 tahun (2027–2035), mekanisme 1 calon melawan kotak kosong, dan pengunduran diri perangkat desa.',
      '/docs/PP_Nomor_16_Tahun_2026.pdf',
      'PP_Nomor_16_Tahun_2026.pdf',
      '11.1 MB (PDF Asli)'
    ),
    (
      'ann-3',
      'LAMPIRAN II SK BUPATI',
      'Matriks Rinci 9 Tahapan & Jadwal Waktu Pilkades Serentak Gelombang I Kabupaten Tegal Tahun 2027',
      'JADWAL RESMI',
      '4 Agustus 2026',
      'Tabel rinci waktu pelaksanaan tahapan mulai dari Sosialisasi, Penerimaan Berkas Balon (12–20 Nov 2026), Coklit DPS (3–11 Des 2026), DPT Final (28 Des 2026), hingga Pelantikan (Apr 2027).',
      '/docs/Tahapan_Pilkades_2027.pdf',
      'Tahapan_Pilkades_2027.pdf',
      '2.3 MB (PDF Asli)'
    ),
    (
      'ann-4',
      'PERBUP NO. 27 TAHUN 2018',
      'Peraturan Bupati Tegal tentang Petunjuk Teknis Pelaksanaan Pemilihan Kepala Desa di Kabupaten Tegal',
      'PERATURAN BUPATI',
      '2018 / 2019',
      'Pedoman teknis pembentukan Panitia Pilkades, tata tertib pemungutan dan penghitungan suara, serta penataan tempat pemungutan suara (TPS).',
      '/docs/Perbup_Tegal_Nomor_27_Tahun_2018.pdf',
      'Perbup_Tegal_Nomor_27_Tahun_2018.pdf',
      '12.4 MB (PDF Asli)'
    ),
    (
      'ann-5',
      '006/P2KD-KLS/XII/2026',
      'Pengumuman Daftar Pemilih Sementara (DPS) & Pembukaan Masa Tanggapan Warga',
      'BERITA ACARA',
      '14 Desember 2026',
      'Diumumkan bahwa DPS Pilkades Kalisalak telah ditetapkan per 11 Desember 2026. Warga dapat mengajukan perbaikan atau pendaftaran pemilih baru melalui formulir aduan online portal ini.',
      '/docs/Tahapan_Pilkades_2027.pdf',
      'Pengumuman_DPS_Kalisalak.pdf',
      'Dokumen Resmi'
    ),
    (
      'ann-6',
      '003/P2KD-KLS/XI/2026',
      'Pengumuman Pendaftaran dan Penerimaan Berkas Bakal Calon Kepala Desa Kalisalak',
      'PENGUMUMAN P2KD',
      '6 November 2026',
      'Pembukaan penerimaan berkas pendaftaran bakal calon Kepala Desa Kalisalak masa bakti periode 2027–2035 bagi putra-putri terbaik warga negara Indonesia.',
      '/docs/PP_Nomor_16_Tahun_2026.pdf',
      'Pengumuman_Pendaftaran_Balon_Kades.pdf',
      'Dokumen Resmi'
    )
    ON CONFLICT (id) DO UPDATE SET
      judul = EXCLUDED.judul,
      ringkasan = EXCLUDED.ringkasan,
      file_url = EXCLUDED.file_url,
      file_name = EXCLUDED.file_name,
      file_size = EXCLUDED.file_size;

    -- 6. Seed Tabung Pemilihan di Lapangan Desa Kalisalak (13 RW / 39 RT)
    INSERT INTO tps (id, kode_tps, nomor_tps, nama_tps, nama_tabung, lokasi, alamat, rt, rw, kuota_maksimal, status)
    VALUES
    ('tps-1', 'TPS-01', '01', 'Tabung Pemilihan 01', 'Tabung Pemilihan 01 (Pintu Masuk Barat)', 'Lapangan Desa Kalisalak', 'Sisi Barat Lapangan Desa Kalisalak', 'RT 01-03', 'RW 01, RW 02', 600, 'AKTIF'),
    ('tps-2', 'TPS-02', '02', 'Tabung Pemilihan 02', 'Tabung Pemilihan 02 (Pintu Masuk Barat)', 'Lapangan Desa Kalisalak', 'Sisi Barat Lapangan Desa Kalisalak', 'RT 01-03', 'RW 03, RW 04', 600, 'AKTIF'),
    ('tps-3', 'TPS-03', '03', 'Tabung Pemilihan 03', 'Tabung Pemilihan 03 (Pintu Masuk Utara)', 'Lapangan Desa Kalisalak', 'Sisi Utara Lapangan Desa Kalisalak', 'RT 01-03', 'RW 05, RW 06', 600, 'AKTIF'),
    ('tps-4', 'TPS-04', '04', 'Tabung Pemilihan 04', 'Tabung Pemilihan 04 (Pintu Masuk Utara)', 'Lapangan Desa Kalisalak', 'Sisi Utara Lapangan Desa Kalisalak', 'RT 01-03', 'RW 07, RW 08', 600, 'AKTIF'),
    ('tps-5', 'TPS-05', '05', 'Tabung Pemilihan 05', 'Tabung Pemilihan 05 (Pintu Masuk Timur)', 'Lapangan Desa Kalisalak', 'Sisi Timur Lapangan Desa Kalisalak', 'RT 01-03', 'RW 09, RW 10', 600, 'AKTIF'),
    ('tps-6', 'TPS-06', '06', 'Tabung Pemilihan 06', 'Tabung Pemilihan 06 (Pintu Masuk Timur)', 'Lapangan Desa Kalisalak', 'Sisi Timur Lapangan Desa Kalisalak', 'RT 01-03', 'RW 11, RW 12', 600, 'AKTIF'),
    ('tps-7', 'TPS-07', '07', 'Tabung Pemilihan 07', 'Tabung Pemilihan 07 (Pintu Masuk Utama Selatan)', 'Lapangan Desa Kalisalak', 'Sisi Selatan Lapangan Desa Kalisalak', 'RT 01-03', 'RW 13 & Khusus', 500, 'AKTIF')
    ON CONFLICT (id) DO UPDATE SET
      nama_tabung = EXCLUDED.nama_tabung,
      lokasi = EXCLUDED.lokasi,
      alamat = EXCLUDED.alamat,
      rt = EXCLUDED.rt,
      rw = EXCLUDED.rw;
  `;

  console.log("Menjalankan migrasi tabel-tabel Supabase Cloud...");
  const res = await runSupabaseSql(sql);
  console.log("Hasil Migrasi:", res);
}

main().catch(console.error);
