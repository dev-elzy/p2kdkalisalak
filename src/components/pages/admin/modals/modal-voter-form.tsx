import React from "react";
import { Input, Button } from "@/components/ui";
import { VoterFormData, TPSItem } from "../types";
import {
  DAFTAR_RW_KALISALAK,
  DAFTAR_RT_KALISALAK,
  getAutoTabungByRtRw,
  normalizeWilayahCode,
} from "@/lib/kalisalak-wilayah";

interface ModalVoterFormProps {
  isOpen: boolean;
  isEdit: boolean;
  voterForm: VoterFormData;
  setVoterForm: React.Dispatch<React.SetStateAction<VoterFormData>>;
  tpsList: TPSItem[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ModalVoterForm: React.FC<ModalVoterFormProps> = ({
  isOpen,
  isEdit,
  voterForm,
  setVoterForm,
  tpsList,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const currentRw = normalizeWilayahCode(voterForm.rw || "01");
  const rawRt = normalizeWilayahCode(voterForm.rt || "01");
  const currentRt = ["01", "02", "03"].includes(rawRt)
    ? rawRt
    : `0${((parseInt(rawRt, 10) - 1) % 3) + 1}`;

  const handleRwChange = (newRw: string) => {
    const autoTps = getAutoTabungByRtRw(newRw, currentRt, tpsList);
    setVoterForm((prev) => ({
      ...prev,
      rw: newRw,
      tps: autoTps,
    }));
  };

  const handleRtChange = (newRt: string) => {
    const autoTps = getAutoTabungByRtRw(currentRw, newRt, tpsList);
    setVoterForm((prev) => ({
      ...prev,
      rt: newRt,
      tps: autoTps,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            {isEdit ? "Koreksi Data Pemilih" : "Tambah Pemilih Baru Secara Manual"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nomor Induk Kependudukan (NIK 16 Digit)
            </label>
            <Input
              type="text"
              maxLength={16}
              placeholder="332801..."
              value={voterForm.nik}
              onChange={(e) => setVoterForm({ ...voterForm, nik: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nomor Kartu Keluarga (No. KK)
            </label>
            <Input
              type="text"
              maxLength={16}
              placeholder="332801..."
              value={voterForm.kk}
              onChange={(e) => setVoterForm({ ...voterForm, kk: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama Lengkap (Sesuai KTP-el)
            </label>
            <Input
              type="text"
              placeholder="Contoh: AHMAD FAUZI"
              value={voterForm.namaLengkap}
              onChange={(e) => setVoterForm({ ...voterForm, namaLengkap: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
              <Input
                type="text"
                value={voterForm.tempatLahir}
                onChange={(e) => setVoterForm({ ...voterForm, tempatLahir: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
              <Input
                type="date"
                value={voterForm.tanggalLahir}
                onChange={(e) => setVoterForm({ ...voterForm, tanggalLahir: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={voterForm.jenisKelamin}
                onChange={(e) =>
                  setVoterForm({ ...voterForm, jenisKelamin: e.target.value as "L" | "P" })
                }
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Perkawinan</label>
              <select
                value={voterForm.statusPerkawinan}
                onChange={(e) =>
                  setVoterForm({
                    ...voterForm,
                    statusPerkawinan: e.target.value as "B" | "S" | "P",
                  })
                }
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="S">Sudah Kawin (S)</option>
                <option value="B">Belum Kawin (B)</option>
                <option value="P">Pernah Kawin / Cerai (P)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                RW Domisili Kalisalak
              </label>
              <select
                value={currentRw}
                onChange={(e) => handleRwChange(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
              >
                {DAFTAR_RW_KALISALAK.map((rw) => (
                  <option key={rw.value} value={rw.value}>
                    {rw.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                RT Domisili
              </label>
              <select
                value={currentRt}
                onChange={(e) => handleRtChange(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
              >
                {DAFTAR_RT_KALISALAK.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  Tabung TPS
                </label>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-100/80 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <svg className="w-2.5 h-2.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Terkunci Otomatis
                </span>
              </div>
              <div
                title="Tabung TPS terkunci otomatis dari pemetaan RT/RW resmi Desa Kalisalak"
                className="w-full h-10 px-3 text-xs rounded-xl border border-blue-300 bg-blue-50/80 font-black text-blue-900 flex items-center justify-between cursor-not-allowed select-none shadow-xs"
              >
                <span className="truncate">
                  {voterForm.tps || getAutoTabungByRtRw(currentRw, currentRt, tpsList)}
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-200/60 px-1.5 py-0.5 rounded shrink-0 ml-1">
                  Lapangan
                </span>
              </div>
              <input type="hidden" name="tps" value={voterForm.tps || getAutoTabungByRtRw(currentRw, currentRt, tpsList)} />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="font-bold">
              Simpan Data
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
