export interface Voter {
  id: string;
  nik: string;
  nikMasked: string;
  kk: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  statusPerkawinan: "B" | "S" | "P";
  alamat: string;
  rt: string;
  rw: string;
  desa: string;
  kecamatan: string;
  tps: string;
  statusAktif: "AKTIF" | "TMS" | "MUTASI_KELUAR";
  alasanTms?: string;
  disabilitas?: string;
  coklitStatus?: "BELUM_COKLIT" | "SESUAI" | "UBAH_DATA" | "TMS" | "BARU";
  coklitTanggal?: string;
  coklitCatatan?: string;
  coklitPetugas?: string;
  updatedAt: string;
}

export interface Aduan {
  id: string;
  nomorAduan: string;
  namaPelapor: string;
  nik: string;
  nikMasked: string;
  kontakPelapor: string;
  rt: string;
  rw: string;
  jenisAduan: "BELUM_TERDAFTAR" | "DATA_SALAH" | "LAPOR_TMS" | "PINDAH_TPS" | "LAINNYA";
  isiAduan: string;
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
  catatanPetugas?: string;
  tanggal: string;
}

export interface TPSItem {
  id: string;
  kodeTps: string;
  nomorTps: string;
  namaTps: string;
  lokasi: string;
  alamat: string;
  rt: string;
  rw: string;
  kuotaMaksimal: number;
  status: "AKTIF" | "NONAKTIF";
  totalPemilih?: number;
  laki?: number;
  perempuan?: number;
  sisaKuota?: number;
  persentaseTerisi?: number;
}

export interface BalonPenjaringanItem {
  id: string;
  namaLengkap: string;
  nik: string;
  tempatTanggalLahir: string;
  alamatDomisili: string;
  pendidikanTerakhir: string;
  pekerjaan: string;
  fotoUrl?: string;
  tanggalPendaftaran: string;
  statusBerkas: "LENGKAP" | "BELUM_LENGKAP" | "DITOLAK";
  kelengkapan: {
    suratLamaran: boolean;
    ktpDanKk: boolean;
    ijazahLegalisir: boolean;
    skck: boolean;
    bebasNarkoba: boolean;
    keteranganSehat: boolean;
    keteranganPengadilan: boolean;
    pernyataanSetia: boolean;
  };
  catatanPenjaringan?: string;
}

export interface Kandidat {
  id: string;
  nomorUrut: number;
  namaLengkap: string;
  gelarDepan?: string;
  gelarBelakang?: string;
  tempatTanggalLahir: string;
  pendidikanTerakhir: string;
  pekerjaan: string;
  tagline: string;
  visi: string;
  misi: string[];
  programUnggulan: string[];
  fotoUrl: string;
  warnaTema: string;
  statusVerifikasi: "TERDAFTAR" | "MS" | "DITETAPKAN";
  skorPenilaian?: {
    pengalamanPemdes: number; // Max 35%
    pendidikan: number; // Max 35%
    usia: number; // Max 30%
    totalSkor: number;
  };
}

export interface TpsRealCountItem {
  tpsId: string;
  nomorTps: string;
  namaTps: string;
  lokasi: string;
  totalDpt: number;
  suaraMasuk: number;
  suaraSah: number;
  suaraTidakSah: number;
  suaraKandidat: Record<number, number>; // nomorUrut -> jumlah suara
  statusPlenoTps: "BELUM" | "SELESAI";
  waktuInput?: string;
  petugasInput?: string;
}

export interface RealCountStats {
  totalDptDesa: number;
  totalSuaraMasuk: number;
  totalSuaraSah: number;
  totalSuaraTidakSah: number;
  persentasePartisipasi: number;
  tpsMasukCount: number;
  totalTpsCount: number;
  kandidatStats: Array<{
    nomorUrut: number;
    namaLengkap: string;
    totalSuara: number;
    persentaseSuara: number;
    warnaTema: string;
  }>;
}

export type SeksiP2KDType =
  | "PIMPINAN"
  | "SEKSI_PEMILIH"
  | "SEKSI_PENJARINGAN"
  | "SEKSI_PENYARINGAN"
  | "SEKSI_PUNGUT_HITUNG"
  | "SEKSI_LOGISTIK_PUBLIKASI"
  | "PANTARLIH_LAPANGAN";

export interface AnggotaP2KD {
  id: string;
  namaLengkap: string;
  nik: string;
  jabatan: string;
  seksi: SeksiP2KDType;
  seksiLabel: string;
  username: string;
  role: string;
  kontakWa: string;
  alamatDusun: string;
  assignedTps?: string;
  status: "AKTIF" | "NONAKTIF";
  skPenetapan: string;
  fotoUrl?: string;
}

export interface AuditLog {
  id: string;
  waktu: string;
  user: string;
  role: string;
  aksi: string;
  entity: string;
  target: string;
  detail: string;
  ipAddress: string;
}

export interface DbStatus {
  provider: string;
  configured: boolean;
  connected: boolean;
  latencyMs: number | null;
  mode: string;
  maskedConnectionString: string;
  stats?: {
    totalPemilih: number;
    totalAktif: number;
    totalTms: number;
    totalTps: number;
    totalAduan: number;
  };
}

export interface VoterFormData {
  nik: string;
  kk: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  statusPerkawinan: "B" | "S" | "P";
  alamat: string;
  rt: string;
  rw: string;
  tps: string;
  statusAktif: "AKTIF" | "TMS";
  alasanTms: string;
}

export interface UserProfile {
  username: string;
  nama: string;
  role: string;
  seksi?: SeksiP2KDType;
  assignedTps?: string; // e.g. "TPS 001" or "001"
  isSuperAdmin: boolean;
}

export type TabType =
  | "dashboard"
  | "pemilih"
  | "coklit"
  | "aduan"
  | "penjaringan"
  | "kandidat"
  | "realcount"
  | "tps"
  | "print"
  | "export"
  | "lock"
  | "anggota"
  | "audit"
  | "pengaturan_web";
