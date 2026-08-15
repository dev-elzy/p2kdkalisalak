/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button, Input, Badge } from "@/components/ui";
import {
  FileCheck2,
  UserPlus,
  Search,
  Trash2,
  X,
  Camera,
  Upload,
} from "lucide-react";
import { BalonPenjaringanItem } from "../types";
import { useToast } from "@/hooks/use-toast";

interface TabPenjaringanBalonProps {
  balonList: BalonPenjaringanItem[];
  isAdmin?: boolean;
  currentUser: string;
  onRefresh: () => void;
}

export const TabPenjaringanBalon: React.FC<TabPenjaringanBalonProps> = ({
  balonList,
  currentUser,
  onRefresh,
}) => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("SEMUA");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [activeBalon, setActiveBalon] = useState<BalonPenjaringanItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add
  const [formData, setFormData] = useState({
    namaLengkap: "",
    nik: "",
    tempatTanggalLahir: "Tegal, 01 Januari 1980",
    alamatDomisili: "Desa Kalisalak",
    pendidikanTerakhir: "Sarjana (S1)",
    pekerjaan: "Wiraswasta / Pengusaha / Pedagang",
    fotoUrl: "",
    tanggalPendaftaran: new Date().toLocaleDateString("id-ID"),
    catatanPenjaringan: "Pendaftaran bakal calon Kepala Desa Kalisalak.",
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Ukuran Terlalu Besar", "Ukuran foto maksimal 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, fotoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Checklist State for Verify Modal
  const [checklist, setChecklist] = useState({
    suratLamaran: true,
    ktpDanKk: true,
    ijazahLegalisir: true,
    skck: true,
    bebasNarkoba: true,
    keteranganSehat: true,
    keteranganPengadilan: true,
    pernyataanSetia: true,
  });
  const [verifyCatatan, setVerifyCatatan] = useState("");

  const berkasLabels = [
    { key: "suratLamaran", label: "1. Surat Permohonan / Lamaran Tertulis (Bermaterai)" },
    { key: "ktpDanKk", label: "2. Fotokopi KTP-el & Kartu Keluarga (WNI Penduduk Kalisalak)" },
    { key: "ijazahLegalisir", label: "3. Fotokopi Ijazah Pendidikan Formal Dilegalisir (Min. SLTP/Sederajat)" },
    { key: "skck", label: "4. Surat Keterangan Catatan Kepolisian (SKCK) dari Polres" },
    { key: "bebasNarkoba", label: "5. Surat Keterangan Bebas Narkoba (BNN / RS Pemerintah)" },
    { key: "keteranganSehat", label: "6. Surat Keterangan Sehat Jasmani & Jiwa (RSUD / Puskesmas)" },
    { key: "keteranganPengadilan", label: "7. Surat Keterangan Tidak Sedang Dicabut Hak Pilih (Pengadilan Negeri)" },
    { key: "pernyataanSetia", label: "8. Surat Pernyataan Setia Pancasila, UUD 1945 & NKRI" },
  ];

  const filteredList = balonList.filter((b) => {
    const matchSearch =
      b.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.nik.includes(searchTerm) ||
      b.pekerjaan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      selectedStatusFilter === "SEMUA" || b.statusBerkas === selectedStatusFilter;

    return matchSearch && matchStatus;
  });

  const totalBalon = balonList.length;
  const countLengkap = balonList.filter((b) => b.statusBerkas === "LENGKAP").length;
  const countBelumLengkap = balonList.filter((b) => b.statusBerkas === "BELUM_LENGKAP").length;

  const handleOpenAdd = () => {
    setFormData({
      namaLengkap: "",
      nik: "",
      tempatTanggalLahir: "Tegal, 01 Januari 1980",
      alamatDomisili: "Desa Kalisalak",
      pendidikanTerakhir: "Sarjana (S1)",
      pekerjaan: "Wiraswasta / Pengusaha / Pedagang",
      fotoUrl: "",
      tanggalPendaftaran: new Date().toLocaleDateString("id-ID"),
      catatanPenjaringan: "Pendaftaran bakal calon Kepala Desa Kalisalak.",
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.nik) {
      toast.error("Gagal", "Nama lengkap dan NIK wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token") : null;
      const res = await fetch("/api/admin/balon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...formData, user: currentUser }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Terdaftar", "Pendaftaran bakal calon berhasil dicatat.");
        setShowAddModal(false);
        onRefresh();
      } else {
        toast.error("Gagal", json.message);
      }
    } catch {
      toast.error("Error", "Gagal menghubungkan ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenVerify = (b: BalonPenjaringanItem) => {
    setActiveBalon(b);
    setChecklist({
      suratLamaran: b.kelengkapan.suratLamaran,
      ktpDanKk: b.kelengkapan.ktpDanKk,
      ijazahLegalisir: b.kelengkapan.ijazahLegalisir,
      skck: b.kelengkapan.skck,
      bebasNarkoba: b.kelengkapan.bebasNarkoba,
      keteranganSehat: b.kelengkapan.keteranganSehat,
      keteranganPengadilan: b.kelengkapan.keteranganPengadilan,
      pernyataanSetia: b.kelengkapan.pernyataanSetia,
    });
    setVerifyCatatan(b.catatanPenjaringan || "");
    setShowVerifyModal(true);
  };

  const handleSaveVerify = async () => {
    if (!activeBalon) return;
    const allChecked = Object.values(checklist).every(Boolean);
    const newStatus = allChecked ? "LENGKAP" : "BELUM_LENGKAP";

    setIsSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token") : null;
      const res = await fetch("/api/admin/balon", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: activeBalon.id,
          kelengkapan: checklist,
          statusBerkas: newStatus,
          catatanPenjaringan: verifyCatatan,
          user: currentUser,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          "Verifikasi Disimpan",
          `Status kelengkapan berkas ${activeBalon.namaLengkap} diset ke ${newStatus}.`
        );
        setShowVerifyModal(false);
        onRefresh();
      } else {
        toast.error("Gagal", json.message);
      }
    } catch {
      toast.error("Error", "Gagal memperbarui verifikasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (b: BalonPenjaringanItem) => {
    if (!window.confirm(`Hapus berkas pendaftaran ${b.namaLengkap}?`)) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token") : null;
      const res = await fetch(`/api/admin/balon?id=${encodeURIComponent(b.id)}&user=${encodeURIComponent(currentUser)}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Dihapus", "Data pendaftaran berhasil dihapus.");
        onRefresh();
      }
    } catch {
      toast.error("Error", "Gagal menghapus data.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Hero Header */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white border border-blue-900/60 shadow-lg rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="primary"
                className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border-blue-400/30 px-3 py-0.5 rounded-full"
              >
                Seksi I: Penjaringan Balon
              </Badge>
              <span className="text-xs text-slate-400 font-medium">• 8 Dokumen Persyaratan Regulasi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileCheck2 className="w-6 h-6 text-blue-400" />
              Seksi Penjaringan Berkas Bakal Calon
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-normal">
              Penerimaan pendaftaran dan penelitian kelengkapan 8 dokumen persyaratan administrasi Bakal Calon (Balon) Kepala Desa sebelum dilanjutkan ke tahap penetapan.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-500 shadow-md rounded-2xl py-2.5 px-4"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Daftarkan Bakal Calon
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5 bg-white border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Bakal Calon Terdaftar
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalBalon} Orang</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Masa Pendaftaran Resmi</div>
        </Card>

        <Card className="p-3.5 bg-white border-emerald-200 bg-emerald-50/30">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Berkas Lengkap & Memenuhi Syarat
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{countLengkap} Balon</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Siap Lanjut ke Seksi Penyaringan</div>
        </Card>

        <Card className="p-3.5 bg-white border-amber-200 bg-amber-50/30">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Belum Lengkap / Perlu Perbaikan
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{countBelumLengkap} Balon</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Dalam Masa Klarifikasi Berkas</div>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 bg-white border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama bakal calon, NIK, pekerjaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="SEMUA">Semua Status Berkas</option>
            <option value="LENGKAP">Berkas Lengkap (MS)</option>
            <option value="BELUM_LENGKAP">Belum Lengkap</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>
      </Card>

      {/* Balon Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((b) => {
          const checkedCount = Object.values(b.kelengkapan).filter(Boolean).length;
          const isComplete = b.statusBerkas === "LENGKAP";

          return (
            <Card
              key={b.id}
              className={`p-5 bg-white border transition-all hover:shadow-md flex flex-col justify-between ${isComplete ? "border-emerald-200 shadow-xs" : "border-amber-200"
                }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black text-sm overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                      {b.fotoUrl ? (
                        <img src={b.fotoUrl} alt={b.namaLengkap} className="w-full h-full object-cover" />
                      ) : (
                        b.namaLengkap[0]
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{b.namaLengkap}</h4>
                      <div className="text-[10px] text-slate-400 font-mono">NIK: {b.nik}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${isComplete
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                  >
                    {isComplete ? "LENGKAP" : "BELUM LENGKAP"}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>TTL: <strong className="text-slate-800">{b.tempatTanggalLahir}</strong></div>
                  <div>Pendidikan: <strong className="text-slate-800">{b.pendidikanTerakhir}</strong></div>
                  <div>Pekerjaan: <strong className="text-slate-800">{b.pekerjaan}</strong></div>
                  <div>Alamat: <span className="text-slate-700">{b.alamatDomisili}</span></div>
                  <div>Tgl Daftar: <span className="text-slate-500 font-mono">{b.tanggalPendaftaran}</span></div>
                </div>

                {/* Checklist Progress */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-600">Kelengkapan Persyaratan (8 Berkas):</span>
                    <span className={isComplete ? "text-emerald-700" : "text-amber-700"}>
                      {checkedCount} / 8 Terpenuhi
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${isComplete ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      style={{ width: `${(checkedCount / 8) * 100}%` }}
                    />
                  </div>
                </div>

                {b.catatanPenjaringan && (
                  <div className="text-[10px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                    &ldquo;{b.catatanPenjaringan}&rdquo;
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenVerify(b)}
                  className="text-xs font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                >
                  <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                  Verifikasi Berkas
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(b)}
                    title="Hapus Bakal Calon"
                    className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* --- MODAL DAFTAR BALON BARU --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pendaftaran Bakal Calon Kades
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Formulir Penerimaan Pendaftaran Seksi Penjaringan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
              {/* Upload Pasfoto Resmi */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block font-bold text-slate-700 mb-1.5">
                  Pasfoto Resmi Bakal Calon (Foto Profil)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 border-2 border-indigo-200 text-indigo-700 flex items-center justify-center font-black overflow-hidden shrink-0 shadow-2xs">
                    {formData.fotoUrl ? (
                      <img src={formData.fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      id="balon-photo-upload"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="balon-photo-upload"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[11px] cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formData.fotoUrl ? "Ganti Pasfoto" : "Unggah Pasfoto"}</span>
                      </label>
                      {formData.fotoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, fotoUrl: "" }))}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-[11px] border border-rose-200"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Format: JPG/PNG/WebP maks 3MB (Pasfoto latar merah/biru).
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: H. BAMBANG SUJARWO, S.E."
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK *</label>
                  <Input
                    type="text"
                    maxLength={16}
                    placeholder="332801..."
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                  <select
                    value={formData.pendidikanTerakhir}
                    onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                    className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                    required
                  >
                    <option value="" disabled>-- Pilih Jenjang --</option>
                    <option value="SLTP / SMP / MTs / Sederajat">SLTP / SMP / MTs / Sederajat</option>
                    <option value="SLTA / SMA / SMK / MA / Sederajat">SLTA / SMA / SMK / MA / Sederajat</option>
                    <option value="Diploma I (D1)">Diploma I (D1)</option>
                    <option value="Diploma II (D2)">Diploma II (D2)</option>
                    <option value="Diploma III (D3) / Ahli Madya">Diploma III (D3) / Ahli Madya</option>
                    <option value="Diploma IV (D4) / Sarjana Terapan">Diploma IV (D4) / Sarjana Terapan</option>
                    <option value="Sarjana (S1)">Sarjana (S1)</option>
                    <option value="Magister (S2)">Magister (S2)</option>
                    <option value="Doktoral (S3)">Doktoral (S3)</option>
                    <option value="Pendidikan Pesantren / Diniyah Formal">Pendidikan Pesantren / Diniyah Formal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tempat & Tanggal Lahir
                </label>
                <Input
                  type="text"
                  placeholder="Tegal, 12 Juli 1978"
                  value={formData.tempatTanggalLahir}
                  onChange={(e) => setFormData({ ...formData, tempatTanggalLahir: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pekerjaan / Latar Belakang Profesi
                </label>
                <select
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  required
                >
                  <option value="" disabled>-- Pilih Pekerjaan --</option>
                  <option value="Wiraswasta / Pengusaha / Pedagang">Wiraswasta / Pengusaha / Pedagang</option>
                  <option value="Petani / Pekebun / Peternak">Petani / Pekebun / Peternak</option>
                  <option value="Karyawan Swasta">Karyawan Swasta</option>
                  <option value="Pegawai Negeri Sipil (PNS / ASN)">Pegawai Negeri Sipil (PNS / ASN)</option>
                  <option value="PPPK (Pegawai Pemerintah Perjanjian Kerja)">PPPK (Pegawai Pemerintah Perjanjian Kerja)</option>
                  <option value="Perangkat Desa (Sekdes / Kaur / Kasi / Kadus)">Perangkat Desa (Sekdes / Kaur / Kasi / Kadus)</option>
                  <option value="Karyawan BUMN / BUMD">Karyawan BUMN / BUMD</option>
                  <option value="TNI (Tentara Nasional Indonesia)">TNI (Tentara Nasional Indonesia)</option>
                  <option value="POLRI (Kepolisian Negara RI)">POLRI (Kepolisian Negara RI)</option>
                  <option value="Pensiunan (PNS / TNI / POLRI / BUMN)">Pensiunan (PNS / TNI / POLRI / BUMN)</option>
                  <option value="Guru / Dosen / Tenaga Pendidik">Guru / Dosen / Tenaga Pendidik</option>
                  <option value="Dokter / Bidan / Tenaga Kesehatan">Dokter / Bidan / Tenaga Kesehatan</option>
                  <option value="Advokat / Pengacara / Praktisi Hukum">Advokat / Pengacara / Praktisi Hukum</option>
                  <option value="Tokoh Agama / Ulama / Ustadz">Tokoh Agama / Ulama / Ustadz</option>
                  <option value="Tokoh Masyarakat / Pemuda / Aktivis Desa">Tokoh Masyarakat / Pemuda / Aktivis Desa</option>
                  <option value="Buruh Harian Lepas / Pengemudi">Buruh Harian Lepas / Pengemudi</option>
                  <option value="Belum / Tidak Bekerja">Belum / Tidak Bekerja</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Domisili
                </label>
                <Input
                  type="text"
                  placeholder="RT 01/RW 01, Desa Kalisalak"
                  value={formData.alamatDomisili}
                  onChange={(e) => setFormData({ ...formData, alamatDomisili: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  className="font-bold bg-indigo-600 hover:bg-indigo-700"
                >
                  Daftarkan Bakal Calon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL VERIFIKASI 8 BERKAS ADMINISTRASI --- */}
      {showVerifyModal && activeBalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Penelitian Berkas Persyaratan Administrasi
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {activeBalon.namaLengkap} (NIK: {activeBalon.nik})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Checklist 8 Dokumen Wajib Balon Kades (Perbup 27/2018):
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {berkasLabels.map((item) => {
                  const isChecked = checklist[item.key as keyof typeof checklist];
                  return (
                    <label
                      key={item.key}
                      className="flex items-start gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setChecklist({
                            ...checklist,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-[11px] leading-tight ${isChecked ? "text-slate-900 font-semibold" : "text-slate-500"}`}>
                        {item.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Penelitian Berkas / Alasan Jika Belum Lengkap:
                </label>
                <textarea
                  rows={2}
                  value={verifyCatatan}
                  onChange={(e) => setVerifyCatatan(e.target.value)}
                  placeholder="Catatan dari Seksi Penjaringan..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold">
                  Status Berkas:{" "}
                  {Object.values(checklist).every(Boolean) ? (
                    <span className="text-emerald-600">LENGKAP (MS)</span>
                  ) : (
                    <span className="text-amber-600">BELUM LENGKAP</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVerifyModal(false)}
                  >
                    Tutup
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    isLoading={isSubmitting}
                    onClick={handleSaveVerify}
                    className="font-bold bg-emerald-600 hover:bg-emerald-700"
                  >
                    Simpan Hasil Verifikasi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
