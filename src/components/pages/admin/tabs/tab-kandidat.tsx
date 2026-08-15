/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Kandidat, BalonPenjaringanItem } from "../types";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Award,
  GraduationCap,
  Briefcase,
  Calendar,
  Sparkles,
  FileCheck2,
  Camera,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Button, Badge } from "@/components/ui";
import { useToast } from "@/hooks/use-toast";

export const candidateColorPalette = [
  { nomor: 1, name: "Biru Royal", hex: "#2563eb", bg: "bg-blue-600", text: "text-blue-600", border: "border-blue-600", light: "bg-blue-50" },
  { nomor: 2, name: "Hijau Emerald", hex: "#059669", bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-600", light: "bg-emerald-50" },
  { nomor: 3, name: "Kuning / Emas", hex: "#d97706", bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-500", light: "bg-amber-50" },
  { nomor: 4, name: "Merah Marun", hex: "#dc2626", bg: "bg-rose-600", text: "text-rose-600", border: "border-rose-600", light: "bg-rose-50" },
  { nomor: 5, name: "Ungu Violet", hex: "#7c3aed", bg: "bg-purple-600", text: "text-purple-600", border: "border-purple-600", light: "bg-purple-50" },
];

export const JENJANG_PENDIDIKAN_LIST = [
  "SLTP / SMP / MTs / Sederajat (Minimal UU Desa)",
  "SLTA / SMA / SMK / MA / Sederajat",
  "Diploma I (D1)",
  "Diploma II (D2)",
  "Diploma III (D3) / Ahli Madya",
  "Diploma IV (D4) / Sarjana Terapan",
  "Sarjana (S1)",
  "Magister (S2)",
  "Doktoral (S3)",
  "Pendidikan Pesantren / Diniyah Formal",
];

export const DAFTAR_PEKERJAAN_LIST = [
  "Wiraswasta / Pengusaha / Pedagang",
  "Petani / Pekebun / Peternak",
  "Karyawan Swasta",
  "Pegawai Negeri Sipil (PNS / ASN)",
  "PPPK (Pegawai Pemerintah Perjanjian Kerja)",
  "Perangkat Desa (Sekdes / Kaur / Kasi / Kadus)",
  "Karyawan BUMN / BUMD",
  "TNI (Tentara Nasional Indonesia)",
  "POLRI (Kepolisian Negara RI)",
  "Pensiunan (PNS / TNI / POLRI / BUMN)",
  "Guru / Dosen / Tenaga Pendidik",
  "Dokter / Bidan / Tenaga Kesehatan",
  "Advokat / Pengacara / Praktisi Hukum",
  "Tokoh Agama / Ulama / Ustadz",
  "Tokoh Masyarakat / Pemuda / Aktivis Desa",
  "Buruh Harian Lepas / Pengemudi",
  "Belum / Tidak Bekerja",
  "Lainnya",
];

export const getThemeForNomor = (nomor: number) => {
  const safeNomor = Math.max(1, Math.min(5, Number(nomor) || 1));
  const found = candidateColorPalette.find((c) => c.nomor === safeNomor);
  return found || candidateColorPalette[0];
};

interface TabKandidatProps {
  kandidatList: Kandidat[];
  balonList?: BalonPenjaringanItem[];
  isAdmin: boolean;
  onSaveKandidat: (kandidatData: Partial<Kandidat>, isEdit: boolean) => void;
  onDeleteKandidat: (kandidat: Kandidat) => void;
}

export const TabKandidat: React.FC<TabKandidatProps> = ({
  kandidatList,
  balonList = [],
  isAdmin,
  onSaveKandidat,
  onDeleteKandidat,
}) => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [selectedBalonId, setSelectedBalonId] = useState("");

  const initialNomor = kandidatList.length + 1;
  const initialTheme = getThemeForNomor(initialNomor);

  const [formData, setFormData] = useState<Partial<Kandidat>>({
    nomorUrut: initialNomor,
    namaLengkap: "",
    gelarDepan: "",
    gelarBelakang: "",
    tempatTanggalLahir: "Tegal, 01 Januari 1980",
    pendidikanTerakhir: "Sarjana (S1)",
    pekerjaan: "Wiraswasta / Pengusaha / Pedagang",
    fotoUrl: "",
    tagline: "",
    visi: "",
    misi: [""],
    programUnggulan: [""],
    warnaTema: initialTheme.hex,
    statusVerifikasi: "DITETAPKAN",
  });

  const handleOpenAdd = () => {
    const nextNomor = kandidatList.length + 1;
    const theme = getThemeForNomor(nextNomor);
    setIsEdit(false);
    setEditingId("");

    // Find available Balon not yet registered as Kandidat
    const availableBalon = balonList.find(
      (b) => !kandidatList.some((k) => k.namaLengkap.toLowerCase() === b.namaLengkap.toLowerCase())
    ) || balonList[0];

    if (availableBalon) {
      setSelectedBalonId(availableBalon.id);
      setFormData({
        nomorUrut: nextNomor,
        namaLengkap: availableBalon.namaLengkap,
        gelarDepan: "",
        gelarBelakang: "",
        tempatTanggalLahir: availableBalon.tempatTanggalLahir || "Tegal, 01 Januari 1980",
        pendidikanTerakhir: availableBalon.pendidikanTerakhir || "Sarjana (S1)",
        pekerjaan: availableBalon.pekerjaan || "Wiraswasta / Pengusaha / Pedagang",
        fotoUrl: availableBalon.fotoUrl || "",
        tagline: "",
        visi: "Mewujudkan tata kelola Pemerintahan Desa Kalisalak yang bersih, transparan, dan berdaya saing.",
        misi: ["Meningkatkan kualitas pelayanan publik berbasis digital", "Pemberdayaan UMKM dan pembangunan infrastruktur desa yang merata"],
        programUnggulan: ["Pelayanan Dokumen Gratis Cepat 1 Hari", "Alokasi Dana Pemberdayaan Warga RT"],
        warnaTema: theme.hex,
        statusVerifikasi: "DITETAPKAN",
      });
    } else {
      setSelectedBalonId("");
      setFormData({
        nomorUrut: nextNomor,
        namaLengkap: "",
        gelarDepan: "",
        gelarBelakang: "",
        tempatTanggalLahir: "Tegal, 01 Januari 1980",
        pendidikanTerakhir: "Sarjana (S1)",
        pekerjaan: "Wiraswasta / Pengusaha / Pedagang",
        fotoUrl: "",
        tagline: "",
        visi: "",
        misi: ["Meningkatkan transparansi dan digitalisasi pelayanan publik", "Pemberdayaan ekonomi warga dan UMKM desa"],
        programUnggulan: ["Pelayanan Dokumen Gratis 1 Hari", "Bantuan Modal Usaha RT"],
        warnaTema: theme.hex,
        statusVerifikasi: "DITETAPKAN",
      });
    }

    setShowModal(true);
  };

  const handleSelectBalon = (balonId: string) => {
    setSelectedBalonId(balonId);
    const b = balonList.find((item) => item.id === balonId);
    if (b) {
      setFormData((prev) => ({
        ...prev,
        namaLengkap: b.namaLengkap,
        tempatTanggalLahir: b.tempatTanggalLahir || prev.tempatTanggalLahir,
        pendidikanTerakhir: b.pendidikanTerakhir || prev.pendidikanTerakhir,
        pekerjaan: b.pekerjaan || prev.pekerjaan,
        fotoUrl: b.fotoUrl || prev.fotoUrl,
      }));
    }
  };

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

  const handleOpenEdit = (k: Kandidat) => {
    const theme = getThemeForNomor(k.nomorUrut);
    setIsEdit(true);
    setEditingId(k.id);
    setFormData({
      ...k,
      warnaTema: theme.hex, // automatically synchronized
    });
    setShowModal(true);
  };

  const handleNomorChange = (val: number) => {
    const safeNomor = Math.max(1, Math.min(5, val || 1));
    const theme = getThemeForNomor(safeNomor);
    setFormData((prev) => ({
      ...prev,
      nomorUrut: safeNomor,
      warnaTema: theme.hex,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTheme = getThemeForNomor(formData.nomorUrut || 1);
    onSaveKandidat(
      {
        ...formData,
        id: editingId,
        warnaTema: currentTheme.hex, // Enforce automatic color by nomor urut
      },
      isEdit
    );
    setShowModal(false);
  };

  const currentTheme = getThemeForNomor(formData.nomorUrut || 1);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white border border-blue-900/60 shadow-lg rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="primary"
                className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border-blue-400/30 px-3 py-0.5 rounded-full"
              >
                Seksi II: Penyaringan Calon
              </Badge>
              <span className="text-xs text-slate-400 font-medium">• {kandidatList.length} Calon Resmi Ditetapkan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Award className="w-6 h-6 text-amber-400" />
              Penetapan Calon Kepala Desa & Visi Misi
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-normal">
              Penetapan Calon Kepala Desa resmi ditarik langsung dari berkas Bakal Calon (Balon) yang telah diverifikasi memenuhi syarat di Seksi Penjaringan.
            </p>
          </div>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-500 shadow-md shrink-0 rounded-2xl py-2.5 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tetapkan Calon dari Balon
            </Button>
          )}
        </div>
      </Card>

      {/* Grid of Candidates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {kandidatList.map((k) => (
          <Card
            key={k.id}
            className="overflow-hidden border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all bg-white rounded-3xl"
          >
            {/* Top Accent Header based on automatic color */}
            <div
              className="h-3 w-full"
              style={{ backgroundColor: getThemeForNomor(k.nomorUrut).hex }}
            />

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <div
                      className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-md overflow-hidden border border-slate-200"
                      style={{ backgroundColor: getThemeForNomor(k.nomorUrut).hex }}
                    >
                      {k.fotoUrl ? (
                        <img src={k.fotoUrl} alt={k.namaLengkap} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <span className="text-[10px] uppercase tracking-wider opacity-80">NO.</span>
                          <span className="text-xl leading-none">{k.nomorUrut}</span>
                        </>
                      )}
                    </div>
                    {k.fotoUrl && (
                      <span
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white"
                        style={{ backgroundColor: getThemeForNomor(k.nomorUrut).hex }}
                      >
                        {k.nomorUrut}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                      {k.namaLengkap}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {k.pekerjaan} • {k.pendidikanTerakhir}
                    </p>
                    {k.tagline && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-slate-700 italic bg-slate-100 px-2 py-0.5 rounded">
                        &ldquo;{k.tagline}&rdquo;
                      </span>
                    )}
                  </div>
                </div>

                <Badge
                  variant="primary"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold shrink-0"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {k.statusVerifikasi}
                </Badge>
              </div>

              {/* Background Bio */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{k.tempatTanggalLahir}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{k.pendidikanTerakhir}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{k.pekerjaan}</span>
                </div>
              </div>

              {/* Visi */}
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  Visi Utama:
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/50">
                  {k.visi}
                </p>
              </div>

              {/* Misi */}
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  Misi Calon:
                </span>
                <ul className="space-y-1">
                  {k.misi.map((m, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Program Unggulan */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-black uppercase text-blue-900">
                  Program Unggulan:
                </span>
                <div className="flex flex-wrap gap-1">
                  {k.programUnggulan.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-100"
                    >
                      ★ {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions for Admin */}
            {isAdmin && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(k)}
                  className="text-xs font-bold rounded-xl"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit Profil & Foto
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDeleteKandidat(k)}
                  className="text-xs rounded-xl"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Modal Add / Edit Candidate */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                {isEdit ? "Edit Profil & Foto Calon Kepala Desa" : "Penetapan Calon Kepala Desa dari Berkas Balon"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Tarik Data Bakal Calon dari Seksi Penjaringan */}
              {!isEdit && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-blue-700" />
                      Tarik Berkas Bakal Calon Terverifikasi:
                    </span>
                    <Badge variant="primary" className="text-[10px] bg-blue-600 text-white font-bold border-none">
                      {balonList.length} Balon Terdaftar
                    </Badge>
                  </div>

                  {balonList.length > 0 ? (
                    <div>
                      <select
                        value={selectedBalonId}
                        onChange={(e) => handleSelectBalon(e.target.value)}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-blue-300 bg-white font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="" disabled>-- Pilih Bakal Calon dari Hasil Penjaringan --</option>
                        {balonList.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.namaLengkap} ({b.statusBerkas === "LENGKAP" ? "✓ Berkas Lengkap / MS" : "⚠️ " + b.statusBerkas}) - NIK: {b.nik}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-blue-800 font-medium mt-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Data identitas, foto, pendidikan, dan profesi otomatis ditarik dari berkas pendaftaran.</span>
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-600">
                      Belum ada berkas balon yang masuk di Seksi Penjaringan. Anda dapat memasukkan data secara manual.
                    </p>
                  )}
                </div>
              )}

              {/* Upload Pasfoto Calon */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block font-bold text-slate-700 mb-1.5">
                  Pasfoto Resmi Calon Kepala Desa (Tampil di Website Publik)
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-2xl border-2 border-white ring-2 ring-slate-300 text-white flex items-center justify-center font-black overflow-hidden shrink-0 shadow-md relative"
                    style={{ backgroundColor: currentTheme.hex }}
                  >
                    {formData.fotoUrl ? (
                      <img src={formData.fotoUrl} alt="Foto Calon" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-white/80" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      id="kandidat-photo-upload"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="kandidat-photo-upload"
                        className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold text-[11px] cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formData.fotoUrl ? "Ganti Pasfoto" : "Unggah Pasfoto Calon"}</span>
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
                      Format: JPG, PNG, atau WebP. Pasfoto akan tampil di halaman publik dan e-voting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Nomor Urut Input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Urut Undian</label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.nomorUrut}
                    onChange={(e) => handleNomorChange(Number(e.target.value))}
                    required
                    className="text-xs font-black text-blue-900"
                  />
                </div>

                {/* Sampel Warna Otomatis (Bukan Teks Dropdown) */}
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Sampel Warna Tema (Otomatis)
                  </label>
                  <div className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      {/* Visual Color Sample Swatch */}
                      <span
                        className="w-5 h-5 rounded-full shadow-xs border-2 border-white ring-1 ring-slate-300 shrink-0"
                        style={{ backgroundColor: currentTheme.hex }}
                      />
                      <span className="font-bold text-xs text-slate-900">
                        {currentTheme.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 font-semibold">
                        ({currentTheme.hex})
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      No. {formData.nomorUrut || 1}
                    </span>
                  </div>
                </div>

                {/* Standar Sampel Warna Pilkades */}
                <div className="col-span-3">
                  <div className="p-2.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Standar Sampel Warna Pilkades (Menyesuaikan Nomor Urut):
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {candidateColorPalette.map((p) => {
                        const isActive = (formData.nomorUrut || 1) === p.nomor;
                        return (
                          <div
                            key={p.nomor}
                            onClick={() => handleNomorChange(p.nomor)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border cursor-pointer transition-all ${
                              isActive
                                ? "bg-white text-slate-900 border-slate-400 shadow-xs ring-2 ring-blue-500 scale-105"
                                : "bg-white/60 text-slate-600 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full shadow-2xs shrink-0"
                              style={{ backgroundColor: p.hex }}
                            />
                            <span>No. {p.nomor}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <Input
                  placeholder="Contoh: H. BAMBANG SUJARWO, S.E."
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                  required
                  className="text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempat & Tgl Lahir</label>
                  <Input
                    value={formData.tempatTanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tempatTanggalLahir: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenjang Pendidikan Terakhir
                  </label>
                  <select
                    value={formData.pendidikanTerakhir}
                    onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                    className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="" disabled>-- Pilih Jenjang Pendidikan --</option>
                    {JENJANG_PENDIDIKAN_LIST.map((jenjang) => (
                      <option key={jenjang} value={jenjang}>
                        {jenjang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pekerjaan / Latar Belakang Profesi
                </label>
                <select
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="" disabled>-- Pilih Pekerjaan / Latar Belakang --</option>
                  {DAFTAR_PEKERJAAN_LIST.map((pek) => (
                    <option key={pek} value={pek}>
                      {pek}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slogan / Tagline Calon</label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Contoh: Kalisalak Maju, Berdaya, dan Bermartabat"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Visi Utama</label>
                <textarea
                  rows={2}
                  value={formData.visi}
                  onChange={(e) => setFormData({ ...formData, visi: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white leading-relaxed"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)} className="rounded-xl text-xs">
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold rounded-xl text-xs bg-blue-900 hover:bg-blue-800 text-white">
                  {isEdit ? "Simpan Perubahan Calon" : "Tetapkan Sebagai Calon Resmi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
