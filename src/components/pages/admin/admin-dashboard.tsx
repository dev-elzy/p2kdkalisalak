"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import { supabase } from "@/lib/supabase";
import { getAutoTabungByRtRw } from "@/lib/kalisalak-wilayah";

import {
  Voter,
  Aduan,
  TPSItem,
  AuditLog,
  DbStatus,
  VoterFormData,
  TabType,
  Kandidat,
  TpsRealCountItem,
  RealCountStats,
  AnggotaP2KD,
  BalonPenjaringanItem,
  SeksiP2KDType,
} from "./types";

import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";
import { MetricsOverview } from "./metrics-overview";

import { TabDashboardOverview } from "./tabs/tab-dashboard-overview";
import { TabMasterPemilih } from "./tabs/tab-master-pemilih";
import { TabCoklitLapangan } from "./tabs/tab-coklit-lapangan";
import { TabKandidat } from "./tabs/tab-kandidat";
import { TabRealCount } from "./tabs/tab-real-count";
import { TabMasterTPS } from "./tabs/tab-master-tps";
import { TabAduanWarga } from "./tabs/tab-aduan-warga";
import { TabPrintCenter } from "./tabs/tab-print-center";
import { TabFinalisasiDPT } from "./tabs/tab-finalisasi-dpt";
import { TabRekapEkspor } from "./tabs/tab-rekap-ekspor";
import { TabAuditTrail } from "./tabs/tab-audit-trail";
import { TabAnggotaP2KD } from "./tabs/tab-anggota-p2kd";
import { TabPenjaringanBalon } from "./tabs/tab-penjaringan-balon";
import { TabPengaturanWeb } from "./tabs/tab-pengaturan-web";

import { ModalVoterForm } from "./modals/modal-voter-form";
import { ModalTms } from "./modals/modal-tms";
import { ModalMutasi } from "./modals/modal-mutasi";
import { ModalTpsForm } from "./modals/modal-tps-form";
import { ModalForceChangePassword } from "./modals/modal-force-change-password";

export const AdminDashboard: React.FC = () => {
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get("role") || "").toLowerCase().trim();
  const tpsParam = searchParams.get("tps") || "";
  const userParam = searchParams.get("user") || "";

  // 1. Check if assigned to a specific TPS (Field Officer / Pantarlih)
  const isFieldOfficer =
    (tpsParam !== "" && tpsParam !== "SEMUA") ||
    roleParam === "petugas" ||
    roleParam === "pantarlih" ||
    userParam.toLowerCase().includes("lapangan") ||
    userParam.toLowerCase().includes("pantarlih");

  const isSuperAdmin = !isFieldOfficer && (
    roleParam === "super_admin" ||
    roleParam === "sekretaris" ||
    roleParam === "bendahara" ||
    roleParam === "" ||
    userParam === "admin_kalisalak" ||
    userParam === "khasanudin" ||
    userParam === "develzy"
  );

  const isAdmin = isSuperAdmin;
  const assignedTps = tpsParam || (isFieldOfficer ? "Tabung Pemilihan 01" : "SEMUA");
  const currentUser = userParam || (isAdmin ? "admin_kalisalak" : "petugas");
  const router = useRouter();
  const toast = useToast();
  const { confirm, isOpen: isConfirmOpen, options: confirmOptions, handleConfirm, handleCancel } = useConfirm();

  // Dynamic user profile resolution
  let computedUserRole = isSuperAdmin ? "SUPER_ADMIN" : isFieldOfficer ? "PETUGAS_TPS" : roleParam.toUpperCase();
  let computedUserSeksi: SeksiP2KDType = isSuperAdmin ? "PIMPINAN" : isFieldOfficer ? "PANTARLIH_LAPANGAN" : (roleParam.toUpperCase() as SeksiP2KDType);
  let computedUserName = isSuperAdmin ? "Khasanudin, S.Pd.SD" : isFieldOfficer ? `Petugas Lapangan (${assignedTps})` : "Panitia P2KD";
  let computedUserJabatan = isSuperAdmin ? "Ketua P2KD / Superadmin" : isFieldOfficer ? `Pantarlih Lapangan (${assignedTps})` : "Anggota Tim Seksi P2KD";

  if (userParam === "develzy") {
    computedUserName = "Develzy (Developer)";
    computedUserJabatan = "System Architect & Technical Core Developer";
  }

  // Specific role mapping
  if (roleParam === "seksi_pemilih" && !isFieldOfficer) {
    computedUserRole = "SEKSI_PEMILIH";
    computedUserSeksi = "SEKSI_PEMILIH";
    computedUserName = "M. Lu’lu Khulaludin, S.F.U";
    computedUserJabatan = "Koordinator Seksi Pendaftaran Pemilih";
  } else if (roleParam === "seksi_penjaringan") {
    computedUserRole = "SEKSI_PENJARINGAN";
    computedUserSeksi = "SEKSI_PENJARINGAN";
    computedUserName = "Hero Budiadi";
    computedUserJabatan = "Koordinator Seksi Penjaringan Balon";
  } else if (roleParam === "seksi_penyaringan") {
    computedUserRole = "SEKSI_PENYARINGAN";
    computedUserSeksi = "SEKSI_PENYARINGAN";
    computedUserName = "Urip";
    computedUserJabatan = "Koordinator Seksi Penyaringan & Seleksi";
  } else if (roleParam === "seksi_pemungutan") {
    computedUserRole = "SEKSI_PUNGUT_HITUNG";
    computedUserSeksi = "SEKSI_PUNGUT_HITUNG";
    computedUserName = "Wihadi";
    computedUserJabatan = "Koordinator Seksi Pemungutan Suara";
  } else if (roleParam === "seksi_logistik" || roleParam === "seksi_publikasi") {
    computedUserRole = "SEKSI_LOGISTIK_PUBLIKASI";
    computedUserSeksi = "SEKSI_LOGISTIK_PUBLIKASI";
    computedUserName = "Mohamad Khumaidi, S.Pd.I";
    computedUserJabatan = "Koordinator Seksi Perlengkapan & Publikasi";
  } else if (roleParam === "seksi_keamanan") {
    computedUserRole = "SEKSI_LOGISTIK_PUBLIKASI";
    computedUserSeksi = "SEKSI_LOGISTIK_PUBLIKASI";
    computedUserName = "Topik Santoso";
    computedUserJabatan = "Koordinator Seksi Keamanan & Ketertiban";
  } else if (roleParam === "sekretaris") {
    computedUserName = "Mashady, M.H.";
    computedUserJabatan = "Sekretaris P2KD";
  } else if (roleParam === "bendahara") {
    computedUserName = "Ali Nurhakim, S.Pd";
    computedUserJabatan = "Bendahara P2KD";
  }

  // Navigation Initial Tab
  const defaultInitialTab: TabType = isFieldOfficer ? "coklit" : roleParam === "seksi_pemilih" ? "pemilih" : roleParam === "seksi_penjaringan" ? "penjaringan" : roleParam === "seksi_penyaringan" ? "kandidat" : roleParam === "seksi_pemungutan" ? "realcount" : roleParam === "seksi_logistik" || roleParam === "seksi_publikasi" ? "print" : "dashboard";

  const [activeTab, setActiveTab] = useState<TabType>(defaultInitialTab);
  const allowedFieldTabs: TabType[] = ["coklit", "pemilih", "print", "realcount"];
  const effectiveActiveTab: TabType = isFieldOfficer && !allowedFieldTabs.includes(activeTab) ? "coklit" : activeTab;
  const [currentCoklitTps, setCurrentCoklitTps] = useState(assignedTps);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data States
  const [voters, setVoters] = useState<Voter[]>([]);
  const [aduanList, setAduanList] = useState<Aduan[]>([]);
  const [tpsList, setTpsList] = useState<TPSItem[]>([]);
  const [kandidatList, setKandidatList] = useState<Kandidat[]>([]);
  const [tpsVoteList, setTpsVoteList] = useState<TpsRealCountItem[]>([]);
  const [anggotaList, setAnggotaList] = useState<AnggotaP2KD[]>([]);
  const [balonList, setBalonList] = useState<BalonPenjaringanItem[]>([]);
  const [realCountStats, setRealCountStats] = useState<RealCountStats>({
    totalDptDesa: 0,
    totalSuaraMasuk: 0,
    totalSuaraSah: 0,
    totalSuaraTidakSah: 0,
    persentasePartisipasi: 0,
    tpsMasukCount: 0,
    totalTpsCount: 7,
    kandidatStats: [],
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [isDptLocked, setIsDptLocked] = useState(false);
  const [lockHashSignature, setLockHashSignature] = useState("");
  const [nomorBeritaAcara, setNomorBeritaAcara] = useState("BA/01/P2KD-KLS/VIII/2026");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTpsFilter, setSelectedTpsFilter] = useState(isAdmin ? "SEMUA" : assignedTps);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("SEMUA");
  const [selectedAduanFilter, setSelectedAduanFilter] = useState("SEMUA");

  // Modal States
  const [showAddVoterModal, setShowAddVoterModal] = useState(false);
  const [showEditVoterModal, setShowEditVoterModal] = useState(false);
  const [showTmsModal, setShowTmsModal] = useState(false);
  const [showMutasiModal, setShowMutasiModal] = useState(false);
  const [showEditTpsModal, setShowEditTpsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("admin_user_data");
        if (stored) {
          const parsed = JSON.parse(stored);
          return Boolean(parsed.mustChangePassword);
        }
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isForcedChangePassword, setIsForcedChangePassword] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("admin_user_data");
        if (stored) {
          const parsed = JSON.parse(stored);
          return Boolean(parsed.mustChangePassword);
        }
      } catch {
        return false;
      }
    }
    return false;
  });

  // Active Target for Modals
  const [activeVoter, setActiveVoter] = useState<Voter | null>(null);
  const [activeTps, setActiveTps] = useState<TPSItem | null>(null);

  // Dynamic lookup from loaded database member list
  const dbMatchedMember = anggotaList.find(
    (a) => a.username.toLowerCase() === currentUser.toLowerCase()
  );
  if (dbMatchedMember) {
    computedUserName = dbMatchedMember.namaLengkap;
    computedUserJabatan = dbMatchedMember.jabatan;
  }

  // Form State for Add / Edit Voter
  const [voterForm, setVoterForm] = useState<VoterFormData>({
    nik: "",
    kk: "",
    namaLengkap: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    statusPerkawinan: "S",
    alamat: "",
    rt: "",
    rw: "",
    tps: "",
    statusAktif: "AKTIF",
    alasanTms: "",
  });

  // Fetch all initial data manually when triggered
  const effectiveTps = isAdmin ? selectedTpsFilter : assignedTps;
  const fetchData = useCallback(async () => {
    try {
      const [
        resVoters,
        resAduan,
        resTps,
        resAudit,
        resDb,
        resKandidat,
        resRealCount,
        resAnggota,
        resBalon,
      ] = await Promise.all([
        fetch(`/api/admin/pemilih?tps=${effectiveTps}&status=${selectedStatusFilter}&role=${isAdmin ? "admin" : "petugas"}&assignedTps=${encodeURIComponent(assignedTps)}`),
        fetch(`/api/admin/aduan?status=${selectedAduanFilter}`),
        fetch("/api/admin/tps"),
        fetch("/api/admin/audit"),
        fetch("/api/admin/db-status"),
        fetch("/api/admin/kandidat"),
        fetch(`/api/admin/real-count?role=${isAdmin ? "admin" : "petugas"}&assignedTps=${encodeURIComponent(assignedTps)}`),
        fetch("/api/admin/anggota"),
        fetch("/api/admin/balon"),
      ]);

      const [
        dataVoters,
        dataAduan,
        dataTps,
        dataAudit,
        dataDb,
        dataKandidat,
        dataRealCount,
        dataAnggota,
        dataBalon,
      ] = await Promise.all([
        resVoters.json(),
        resAduan.json(),
        resTps.json(),
        resAudit.json(),
        resDb.json(),
        resKandidat.json(),
        resRealCount.json(),
        resAnggota.json(),
        resBalon.json(),
      ]);

      if (resVoters.status === 401 || resAduan.status === 401 || resTps.status === 401) {
        toast.error("Sesi Berakhir", "Sesi autentikasi Anda telah berakhir. Silakan masuk kembali.");
        router.push("/admin");
        return;
      }

      if (dataVoters.success) setVoters(dataVoters.data);
      if (dataAduan.success) setAduanList(dataAduan.data);
      if (dataTps.success) setTpsList(dataTps.data);
      if (dataAudit.success) setAuditLogs(dataAudit.data);
      if (dataKandidat.success) setKandidatList(dataKandidat.data);
      if (dataAnggota.success) setAnggotaList(dataAnggota.data);
      if (dataBalon.success) setBalonList(dataBalon.data);
      if (dataRealCount.success) {
        setRealCountStats(dataRealCount.stats);
        setTpsVoteList(dataRealCount.tpsData);
      }
      if (dataDb.success) {
        setDbStatus(dataDb.data);
        if (dataDb.data.tahapan) {
          setIsDptLocked(dataDb.data.tahapan.isDptLocked);
          if (dataDb.data.tahapan.lockHashSignature) {
            setLockHashSignature(dataDb.data.tahapan.lockHashSignature);
          }
          if (dataDb.data.tahapan.nomorBeritaAcara) {
            setNomorBeritaAcara(dataDb.data.tahapan.nomorBeritaAcara);
          }
        }
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  }, [
    effectiveTps,
    selectedStatusFilter,
    selectedAduanFilter,
    isAdmin,
    assignedTps,
    router,
    toast,
    setVoters,
    setAduanList,
    setTpsList,
    setAuditLogs,
    setKandidatList,
    setAnggotaList,
    setBalonList,
    setRealCountStats,
    setTpsVoteList,
    setDbStatus,
    setIsDptLocked,
    setLockHashSignature,
    setNomorBeritaAcara,
    setIsLoading,
  ]);

  // 1. Initial Load & Dynamic Filter Changes
  useEffect(() => {
    let isCancelled = false;
    const runFetch = async () => {
      if (!isCancelled) {
        await fetchData();
      }
    };
    runFetch();
    return () => {
      isCancelled = true;
    };
  }, [fetchData]);

  // 2. Realtime Background Sync (Supabase Realtime Channel + 4-second Fallback Polling)
  useEffect(() => {
    // A. Supabase Realtime Postgres Changes Channel
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => {
          void fetchData();
        }
      )
      .subscribe();

    // B. Silent Background Polling Interval (Every 4 seconds)
    const interval = setInterval(() => {
      void fetchData();
    }, 4000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const handleLogout = () => {
    toast.info("Sesi Berakhir", "Anda telah keluar dari Portal Petugas.");
    router.push("/admin");
  };

  // --- CRUD HANDLERS ---
  const handleSaveNewVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (voterForm.nik.length !== 16) {
      toast.error("Validasi Gagal", "NIK harus berjumlah 16 digit angka.");
      return;
    }

    try {
      const res = await fetch("/api/admin/pemilih", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...voterForm, user: currentUser }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Pemilih Ditambahkan", `Data ${voterForm.namaLengkap} berhasil disimpan ke ${voterForm.tps}.`);
        setShowAddVoterModal(false);
        fetchData();
      } else {
        toast.error("Gagal Menyimpan", result.message);
      }
    } catch {
      toast.error("Kesalahan Jaringan", "Tidak dapat menghubungi server.");
    }
  };

  const handleOpenEditVoter = (v: Voter) => {
    setActiveVoter(v);
    const autoTps = getAutoTabungByRtRw(v.rw, v.rt, tpsList);
    setVoterForm({
      nik: v.nik,
      kk: v.kk || "",
      namaLengkap: v.namaLengkap,
      tempatLahir: v.tempatLahir,
      tanggalLahir: v.tanggalLahir,
      jenisKelamin: v.jenisKelamin,
      statusPerkawinan: v.statusPerkawinan,
      alamat: v.alamat,
      rt: v.rt || "01",
      rw: v.rw || "01",
      tps: autoTps || v.tps,
      statusAktif: v.statusAktif === "TMS" ? "TMS" : "AKTIF",
      alasanTms: v.alasanTms || "",
    });
    setShowEditVoterModal(true);
  };

  const handleSaveEditVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVoter) return;

    try {
      const res = await fetch(`/api/admin/pemilih/${activeVoter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...voterForm,
          user: currentUser,
          alasan: "Koreksi Data Manual Petugas",
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Data Diperbarui", `Perubahan data ${voterForm.namaLengkap} berhasil disimpan.`);
        setShowEditVoterModal(false);
        fetchData();
      } else {
        toast.error("Gagal Update", result.message);
      }
    } catch {
      toast.error("Kesalahan Jaringan", "Gagal memperbarui data.");
    }
  };

  const handleOpenTms = (v: Voter) => {
    setActiveVoter(v);
    setShowTmsModal(true);
  };

  const handleConfirmTms = async (alasan: string, catatan: string) => {
    if (!activeVoter) return;
    try {
      const queryParam = catatan ? `&catatan=${encodeURIComponent(catatan)}` : "";
      const res = await fetch(`/api/admin/pemilih/${activeVoter.id}?mode=tms&alasan=${encodeURIComponent(alasan)}&user=${encodeURIComponent(currentUser)}${queryParam}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        toast.warning("Status Diubah Menjadi TMS", `${activeVoter.namaLengkap} ditandai TMS (${alasan}).`);
        setShowTmsModal(false);
        fetchData();
      }
    } catch {
      toast.error("Gagal", "Tidak dapat memproses TMS.");
    }
  };

  const handleOpenMutasi = (v: Voter) => {
    setActiveVoter(v);
    setShowMutasiModal(true);
  };

  const handleConfirmMutasi = async (tpsBaru: string, rtBaru: string, rwBaru: string) => {
    if (!activeVoter) return;
    try {
      const res = await fetch(`/api/admin/pemilih/${activeVoter.id}/mutasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tpsBaru, rtBaru, rwBaru, user: currentUser }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Mutasi Berhasil", `${activeVoter.namaLengkap} dipindahkan ke ${tpsBaru}.`);
        setShowMutasiModal(false);
        fetchData();
      }
    } catch {
      toast.error("Gagal", "Tidak dapat memproses mutasi TPS.");
    }
  };

  const handleDeleteVoter = async (v: Voter) => {
    const approved = await confirm({
      title: `Hapus Pemilih ${v.namaLengkap}?`,
      message: `Apakah Anda yakin ingin menghapus data pemilih NIK ${v.nikMasked} secara permanen dari master data? Aksi ini akan dicatat dalam audit trail.`,
      confirmText: "Hapus Permanen",
      cancelText: "Batal",
      variant: "danger",
    });

    if (approved) {
      try {
        const res = await fetch(`/api/admin/pemilih/${v.id}?user=${encodeURIComponent(currentUser)}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Data Dihapus", `${v.namaLengkap} telah dihapus dari database.`);
          fetchData();
        }
      } catch {
        toast.error("Gagal", "Tidak dapat menghapus data.");
      }
    }
  };

  // --- ADUAN RESOLUTION ---
  const handleApproveAduan = async (a: Aduan) => {
    try {
      const res = await fetch("/api/admin/aduan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: a.id,
          status: "DISETUJUI",
          catatan: "Disetujui oleh Petugas P2KD & Data Master Terkait Telah Diperbarui.",
          user: currentUser,
          autoUpdateMaster: true,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Aduan Disetujui", `Tiket ${a.nomorAduan} disetujui & data pemilih otomatis diselaraskan.`);
        fetchData();
      }
    } catch {
      toast.error("Gagal", "Tidak dapat memproses aduan.");
    }
  };

  const handleRejectAduan = async (a: Aduan) => {
    try {
      const res = await fetch("/api/admin/aduan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: a.id,
          status: "DITOLAK",
          catatan: "Data atau bukti pendukung tidak memenuhi syarat administrasi.",
          user: currentUser,
          autoUpdateMaster: false,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.warning("Aduan Ditolak", `Tiket ${a.nomorAduan} telah ditolak.`);
        fetchData();
      }
    } catch {
      toast.error("Gagal", "Tidak dapat memproses penolakan aduan.");
    }
  };

  // --- COKLIT HANDLER ---
  const handleUpdateCoklitStatus = async (
    voterId: string,
    status: "SESUAI" | "UBAH_DATA" | "TMS" | "BELUM_COKLIT",
    catatan?: string
  ) => {
    try {
      const res = await fetch("/api/admin/coklit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId,
          status,
          catatan,
          user: currentUser,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Coklit Diperbarui", result.message);
        fetchData();
      } else {
        toast.error("Gagal", result.message);
      }
    } catch {
      toast.error("Kesalahan Jaringan", "Gagal memperbarui status Coklit.");
    }
  };

  // --- DPT LOCK ---
  const handleLockDpt = async () => {
    if (isDptLocked) {
      toast.warning("DPT Sudah Terkunci", "DPT final telah berstatus terkunci.");
      return;
    }

    const approved = await confirm({
      title: "Konfirmasi Penguncian DPT Pilkades Final",
      message: `PERINGATAN: Aksi ini akan mengesahkan Berita Acara Pleno DPT Pilkades Kalisalak (${voters.filter((v) => v.statusAktif === "AKTIF").length} Pemilih Aktif). Seluruh data akan dikunci dengan Segel Kriptografi SHA-256.`,
      confirmText: "Kunci DPT Sekarang",
      cancelText: "Batal",
      variant: "danger",
    });

    if (approved) {
      try {
        const res = await fetch("/api/admin/dpt/lock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "LOCK",
            nomorBeritaAcara,
            user: currentUser,
          }),
        });
        const result = await res.json();
        if (result.success) {
          setIsDptLocked(true);
          setLockHashSignature(result.data.lockHashSignature);
          toast.success(
            "DPT Berhasil Dikunci Secara Permanen",
            "Berita Acara Pleno DPT Pilkades Kalisalak telah disegel secara kriptografis."
          );
          fetchData();
        }
      } catch {
        toast.error("Gagal", "Tidak dapat mengunci DPT.");
      }
    }
  };

  const handleUnlockDpt = async () => {
    const approved = await confirm({
      title: "Buka Kunci DPT (Darurat)",
      message: "PERINGATAN: Membuka kunci DPT hanya diizinkan untuk perbaikan darurat keputusan pleno dan akan dicatat dalam audit trail resmi. Lanjutkan?",
      confirmText: "Buka Kunci DPT",
      cancelText: "Batal",
      variant: "danger",
    });

    if (approved) {
      try {
        const res = await fetch("/api/admin/dpt/lock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UNLOCK",
            alasan: "Perbaikan darurat hasil pleno",
            user: currentUser,
          }),
        });
        const result = await res.json();
        if (result.success) {
          setIsDptLocked(false);
          toast.warning("DPT Dibuka Kembali", "Status DPT kembali ke mode DRAFT untuk perbaikan.");
          fetchData();
        }
      } catch {
        toast.error("Gagal", "Tidak dapat membuka kunci DPT.");
      }
    }
  };

  const handleDeleteTps = async (tps: TPSItem) => {
    const approved = await confirm({
      title: `Hapus ${tps.namaTps}?`,
      message: `Apakah Anda yakin ingin menghapus ${tps.namaTps} (${tps.lokasi})? Tindakan ini hanya diizinkan jika tidak ada pemilih aktif yang terdaftar pada TPS ini.`,
      confirmText: "Hapus TPS",
      cancelText: "Batal",
      variant: "danger",
    });

    if (approved) {
      try {
        const res = await fetch(`/api/admin/tps?id=${tps.id}&user=${encodeURIComponent(currentUser)}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.success) {
          toast.success("TPS Dihapus", result.message);
          fetchData();
        } else {
          toast.error("Gagal Menghapus TPS", result.message);
        }
      } catch {
        toast.error("Kesalahan Jaringan", "Tidak dapat menghubungi server.");
      }
    }
  };

  const handleSaveKandidat = async (kandidatData: Partial<Kandidat>, isEdit: boolean) => {
    try {
      const res = await fetch("/api/admin/kandidat", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...kandidatData, user: currentUser }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(isEdit ? "Profil Diperbarui" : "Calon Ditambahkan", result.message);
        fetchData();
      } else {
        toast.error("Gagal", result.message);
      }
    } catch {
      toast.error("Kesalahan Jaringan", "Tidak dapat menghubungi server.");
    }
  };

  const handleDeleteKandidat = async (kandidat: Kandidat) => {
    const approved = await confirm({
      title: `Hapus Calon No. ${kandidat.nomorUrut}?`,
      message: `Apakah Anda yakin ingin menghapus data calon kepala desa ${kandidat.namaLengkap}?`,
      confirmText: "Hapus Calon",
      cancelText: "Batal",
      variant: "danger",
    });

    if (approved) {
      try {
        const res = await fetch(`/api/admin/kandidat?id=${kandidat.id}&user=${encodeURIComponent(currentUser)}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Calon Dihapus", result.message);
          fetchData();
        } else {
          toast.error("Gagal", result.message);
        }
      } catch {
        toast.error("Kesalahan Jaringan", "Tidak dapat menghubungi server.");
      }
    }
  };

  const handleSubmitTpsVote = async (
    nomorTps: string,
    suaraKandidat: Record<number, number>,
    suaraTidakSah: number,
    statusPlenoTps: "BELUM" | "SELESAI"
  ) => {
    try {
      const res = await fetch("/api/admin/real-count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorTps,
          suaraKandidat,
          suaraTidakSah,
          statusPlenoTps,
          user: currentUser,
          role: isAdmin ? "admin" : "petugas",
          assignedTps,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Hasil Suara Disimpan", result.message);
        fetchData();
      } else {
        toast.error("Gagal Menyimpan", result.message);
      }
    } catch {
      toast.error("Kesalahan Jaringan", "Tidak dapat menghubungi server.");
    }
  };

  // --- STATS COMPUTATION ---
  const totalAktif = voters.filter((v) => v.statusAktif === "AKTIF").length;
  const totalLaki = voters.filter((v) => v.statusAktif === "AKTIF" && v.jenisKelamin === "L").length;
  const totalPerempuan = voters.filter((v) => v.statusAktif === "AKTIF" && v.jenisKelamin === "P").length;
  const totalTms = voters.filter((v) => v.statusAktif === "TMS").length;
  const totalAduanMenunggu = aduanList.filter((a) => a.status === "MENUNGGU").length;

  return (
    <div className="min-h-screen flex bg-slate-100/90 text-slate-900">
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        options={confirmOptions}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* 1. Professional Admin Sidebar */}
      <AdminSidebar
        activeTab={effectiveActiveTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        voterCount={voters.length}
        tpsCount={tpsList.length}
        aduanPendingCount={totalAduanMenunggu}
        isDptLocked={isDptLocked}
        auditCount={auditLogs.length}
        anggotaCount={anggotaList.length}
        balonCount={balonList.length}
        kandidatCount={kandidatList.length}
        dbStatus={dbStatus}
        isAdmin={isAdmin}
        userRole={computedUserRole}
        userSeksi={computedUserSeksi}
        userName={computedUserName}
        userJabatan={computedUserJabatan}
        assignedTps={assignedTps}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* 2. Top Header */}
        <AdminHeader
          activeTab={effectiveActiveTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onRefresh={() => fetchData()}
          isLoading={isLoading}
          dbStatus={dbStatus}
          isAdmin={isAdmin}
          assignedTps={assignedTps}
          isDptLocked={isDptLocked}
          onLogout={handleLogout}
          onOpenChangePassword={() => {
            setIsForcedChangePassword(false);
            setShowChangePasswordModal(true);
          }}
        />

        {/* 3. Main Dashboard Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
          {/* KPI Metrics - Khusus Pimpinan / Seksi Utama P2KD */}
          {!isFieldOfficer && effectiveActiveTab === "dashboard" && (
            <MetricsOverview
              totalAktif={totalAktif}
              totalLaki={totalLaki}
              totalPerempuan={totalPerempuan}
              totalTms={totalTms}
              tpsCount={tpsList.length}
              aduanCount={aduanList.length}
              aduanPendingCount={totalAduanMenunggu}
              isDptLocked={isDptLocked}
            />
          )}

          {/* Active Tab Views */}
          {effectiveActiveTab === "dashboard" && (
            <TabDashboardOverview
              voters={voters}
              tpsList={tpsList}
              aduanList={aduanList}
              kandidatList={kandidatList}
              balonList={balonList}
              isDptLocked={isDptLocked}
              onNavigateTab={(tab) => setActiveTab(tab)}
              currentUser={{
                namaLengkap: computedUserName,
                role: computedUserRole,
                jabatan: computedUserJabatan,
              }}
            />
          )}

          {effectiveActiveTab === "anggota" && (
            <TabAnggotaP2KD
              anggotaList={anggotaList}
              tpsList={tpsList}
              isAdmin={isAdmin}
              userRole={computedUserRole}
              userSeksi={computedUserSeksi}
              currentUser={currentUser}
              onRefresh={() => fetchData()}
            />
          )}

          {effectiveActiveTab === "penjaringan" && (
            <TabPenjaringanBalon
              balonList={balonList}
              isAdmin={isAdmin}
              currentUser={currentUser}
              onRefresh={() => fetchData()}
            />
          )}

          {effectiveActiveTab === "coklit" && (
            <TabCoklitLapangan
              voters={voters}
              tpsList={tpsList}
              currentTps={currentCoklitTps}
              setCurrentTps={setCurrentCoklitTps}
              isAdmin={isAdmin}
              onUpdateCoklitStatus={handleUpdateCoklitStatus}
              onOpenEditVoter={handleOpenEditVoter}
              onOpenAddVoter={() => {
                const autoTps = getAutoTabungByRtRw("01", "01", tpsList);
                setVoterForm({
                  nik: "",
                  kk: "",
                  namaLengkap: "",
                  tempatLahir: "",
                  tanggalLahir: "",
                  jenisKelamin: "L",
                  statusPerkawinan: "S",
                  alamat: "",
                  rt: "01",
                  rw: "01",
                  tps: autoTps,
                  statusAktif: "AKTIF",
                  alasanTms: "",
                });
                setShowAddVoterModal(true);
              }}
              onOpenTms={handleOpenTms}
            />
          )}

          {effectiveActiveTab === "pemilih" && (
            <TabMasterPemilih
              voters={voters}
              tpsList={tpsList}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedTpsFilter={selectedTpsFilter}
              setSelectedTpsFilter={setSelectedTpsFilter}
              selectedStatusFilter={selectedStatusFilter}
              setSelectedStatusFilter={setSelectedStatusFilter}
              isAdmin={isAdmin}
              assignedTps={assignedTps}
              onOpenAddVoter={() => {
                const autoTps = getAutoTabungByRtRw("01", "01", tpsList);
                setVoterForm({
                  nik: "",
                  kk: "",
                  namaLengkap: "",
                  tempatLahir: "",
                  tanggalLahir: "",
                  jenisKelamin: "L",
                  statusPerkawinan: "S",
                  alamat: "",
                  rt: "01",
                  rw: "01",
                  tps: autoTps,
                  statusAktif: "AKTIF",
                  alasanTms: "",
                });
                setShowAddVoterModal(true);
              }}
              onOpenEditVoter={handleOpenEditVoter}
              onOpenMutasi={handleOpenMutasi}
              onOpenTms={handleOpenTms}
              onDeleteVoter={handleDeleteVoter}
            />
          )}

          {effectiveActiveTab === "kandidat" && (
            <TabKandidat
              kandidatList={kandidatList}
              balonList={balonList}
              isAdmin={isAdmin}
              onSaveKandidat={handleSaveKandidat}
              onDeleteKandidat={handleDeleteKandidat}
            />
          )}

          {effectiveActiveTab === "realcount" && (
            <TabRealCount
              kandidatList={kandidatList}
              tpsVoteList={tpsVoteList}
              stats={realCountStats}
              isAdmin={isAdmin}
              assignedTps={assignedTps}
              onSubmitTpsVote={handleSubmitTpsVote}
            />
          )}

          {effectiveActiveTab === "tps" && (
            <TabMasterTPS
              tpsList={tpsList}
              voters={voters}
              onOpenAddTps={() => {
                setActiveTps({
                  id: "",
                  kodeTps: `TPS-KLS-00${tpsList.length + 1}`,
                  nomorTps: `00${tpsList.length + 1}`,
                  namaTps: `TPS 00${tpsList.length + 1}`,
                  lokasi: "",
                  alamat: "",
                  rt: "",
                  rw: "",
                  kuotaMaksimal: 300,
                  status: "AKTIF",
                });
                setShowEditTpsModal(true);
              }}
              onOpenEditTps={(tps) => {
                setActiveTps(tps);
                setShowEditTpsModal(true);
              }}
              onDeleteTps={handleDeleteTps}
            />
          )}

          {effectiveActiveTab === "aduan" && (
            <TabAduanWarga
              aduanList={aduanList}
              selectedAduanFilter={selectedAduanFilter}
              setSelectedAduanFilter={setSelectedAduanFilter}
              onApproveAduan={handleApproveAduan}
              onRejectAduan={handleRejectAduan}
            />
          )}

          {effectiveActiveTab === "print" && (
            <TabPrintCenter
              voters={voters}
              tpsList={tpsList}
              nomorBeritaAcara={nomorBeritaAcara}
              isDptLocked={isDptLocked}
              lockHashSignature={lockHashSignature}
              isAdmin={isAdmin}
              assignedTps={assignedTps}
              anggotaList={anggotaList}
            />
          )}

          {effectiveActiveTab === "lock" && (
            <TabFinalisasiDPT
              isDptLocked={isDptLocked}
              lockHashSignature={lockHashSignature}
              nomorBeritaAcara={nomorBeritaAcara}
              setNomorBeritaAcara={setNomorBeritaAcara}
              totalAktif={totalAktif}
              onLockDpt={handleLockDpt}
              onUnlockDpt={handleUnlockDpt}
            />
          )}

          {effectiveActiveTab === "export" && (
            <TabRekapEkspor tpsList={tpsList} voters={voters} />
          )}

          {effectiveActiveTab === "audit" && (
            <TabAuditTrail auditLogs={auditLogs} />
          )}

          {effectiveActiveTab === "pengaturan_web" && (
            <TabPengaturanWeb currentUser={{ namaLengkap: computedUserName, role: computedUserRole }} />
          )}
        </main>
      </div>

      {/* --- MODALS --- */}
      <ModalVoterForm
        isOpen={showAddVoterModal || showEditVoterModal}
        isEdit={showEditVoterModal}
        voterForm={voterForm}
        setVoterForm={setVoterForm}
        tpsList={tpsList}
        onClose={() => {
          setShowAddVoterModal(false);
          setShowEditVoterModal(false);
        }}
        onSubmit={showAddVoterModal ? handleSaveNewVoter : handleSaveEditVoter}
      />

      <ModalTms
        isOpen={showTmsModal}
        activeVoter={activeVoter}
        onClose={() => setShowTmsModal(false)}
        onConfirmTms={handleConfirmTms}
      />

      <ModalMutasi
        isOpen={showMutasiModal}
        activeVoter={activeVoter}
        tpsList={tpsList}
        onClose={() => setShowMutasiModal(false)}
        onConfirmMutasi={handleConfirmMutasi}
      />

      <ModalTpsForm
        isOpen={showEditTpsModal}
        activeTps={activeTps}
        setActiveTps={setActiveTps}
        onClose={() => setShowEditTpsModal(false)}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!activeTps) return;
          try {
            const isNew = !activeTps.id;
            const url = "/api/admin/tps";
            const method = isNew ? "POST" : "PUT";
            const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...activeTps, user: currentUser }),
            });
            const result = await res.json();
            if (result.success) {
              toast.success("TPS Tersimpan", "Pengaturan master TPS berhasil diperbarui.");
              setShowEditTpsModal(false);
              fetchData();
            }
          } catch {
            toast.error("Gagal", "Tidak dapat menyimpan TPS.");
          }
        }}
      />

      <ModalForceChangePassword
        isOpen={showChangePasswordModal}
        isForced={isForcedChangePassword}
        username={userParam || currentUser || "admin_kalisalak"}
        namaLengkap={computedUserName}
        onSuccess={() => {
          setShowChangePasswordModal(false);
          setIsForcedChangePassword(false);
        }}
        onClose={() => {
          if (!isForcedChangePassword) {
            setShowChangePasswordModal(false);
          }
        }}
      />
    </div>
  );
};
