"use client";

import React from "react";
import { Plus, FileSpreadsheet, MapPin, Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, Badge } from "@/components/ui";
import { Voter, TPSItem } from "../types";

interface TabMasterTPSProps {
  tpsList: TPSItem[];
  voters: Voter[];
  onOpenAddTps: () => void;
  onOpenEditTps: (tps: TPSItem) => void;
  onDeleteTps: (tps: TPSItem) => void;
}

export const TabMasterTPS: React.FC<TabMasterTPSProps> = ({
  tpsList,
  voters,
  onOpenAddTps,
  onOpenEditTps,
  onDeleteTps,
}) => {
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
                Pusat Pemungutan Suara Terpadu
              </Badge>
              <span className="text-xs text-slate-400 font-medium">• Lapangan Desa Kalisalak (13 RW / 39 RT)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <MapPin className="w-6 h-6 text-rose-400" />
              Lokasi Pemungutan & Tabung Pemilihan
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-normal">
              Seluruh pemungutan suara dipusatkan di Lapangan Desa Kalisalak dengan pembagian Tabung/Kotak Pemilihan untuk melayani 13 RW dan 39 RT secara tertib dan efisien.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <a href="/api/admin/export?type=TPS" download title="Unduh Master Data Tabung (.xlsx)">
              <button
                type="button"
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-2 backdrop-blur-md transition-all shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Ekspor Excel</span>
              </button>
            </a>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAddTps}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded-2xl py-2.5 px-4 shadow-md"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah Tabung Baru
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tpsList.map((t) => {
          const votersInTps = voters.filter(
            (v) =>
              v.statusAktif === "AKTIF" &&
              v.tps.toLowerCase().includes(t.nomorTps.toLowerCase())
          );
          return (
            <Card
              key={t.id}
              className="p-4 bg-white border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="primary" className="text-[10px] font-bold">
                    {t.kodeTps}
                  </Badge>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{t.namaTps}</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenEditTps(t)}
                    title="Edit TPS"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteTps(t)}
                    title="Hapus TPS"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">{t.lokasi}</span>
                </div>
                <div className="text-[11px] text-slate-500 pl-5">Alamat: {t.alamat}</div>
                <div className="text-[11px] text-slate-500 pl-5">
                  Cakupan: RT {t.rt} / RW {t.rw}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Pemilih Terdaftar:</span>
                  <strong className="text-blue-700 font-black">{votersInTps.length} Orang</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Status Wilayah:</span>
                  <Badge variant="success" className="text-[10px]">
                    AKTIF PILKADES
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
