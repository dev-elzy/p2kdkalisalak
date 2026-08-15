"use client";

import React, { useState } from "react";
import { UserX } from "lucide-react";
import { Input, Button } from "@/components/ui";
import { Voter } from "../types";

interface ModalTmsProps {
  isOpen: boolean;
  activeVoter: Voter | null;
  onClose: () => void;
  onConfirmTms: (alasan: string, catatan: string) => void;
}

export const ModalTms: React.FC<ModalTmsProps> = ({
  isOpen,
  activeVoter,
  onClose,
  onConfirmTms,
}) => {
  const [alasan, setAlasan] = useState("MENINGGAL");
  const [catatan, setCatatan] = useState("");

  if (!isOpen || !activeVoter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-rose-700">
            <UserX className="w-5 h-5" />
            Tandai Pemilih TMS
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Anda akan menandai <strong>{activeVoter.namaLengkap}</strong> (NIK:{" "}
          {activeVoter.nikMasked}) sebagai Tidak Memenuhi Syarat (TMS).
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Alasan TMS</label>
            <select
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="MENINGGAL">1. Meninggal Dunia</option>
              <option value="GANDA">2. Data Ganda</option>
              <option value="PINDAH_DOMISILI">3. Pindah Domisili Keluar Desa</option>
              <option value="DI_BAWAH_UMUR">4. Di Bawah Umur / Bukan Pemilih</option>
              <option value="TNI_POLRI">5. Menjadi Anggota TNI / POLRI</option>
              <option value="BUKAN_WARGA">6. Bukan Warga Desa Kalisalak</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan / Bukti Pendukung</label>
            <Input
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Surat Kematian Desa No. 472/..."
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => onConfirmTms(alasan, catatan)}
            className="font-bold"
          >
            Tetapkan Status TMS
          </Button>
        </div>
      </div>
    </div>
  );
};
