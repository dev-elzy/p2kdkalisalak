import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function GET() {
  try {
    await dataStore.ensureSynced();
    const list = dataStore.getTpsList();
    const pemilih = dataStore.getPemilihList();

    const publicTps = list.map((t) => {
      const assigned = pemilih.filter(
        (p) => p.statusAktif === "AKTIF" && (p.tps.includes(t.nomorTps) || p.tps.includes(t.namaTps))
      );
      const l = assigned.filter((p) => p.jenisKelamin === "L").length;
      const p = assigned.filter((p) => p.jenisKelamin === "P").length;

      return {
        id: t.id,
        nomorTps: t.nomorTps,
        namaTps: t.namaTps,
        lokasi: t.lokasi,
        alamat: t.alamat,
        rt: t.rt,
        rw: t.rw,
        status: t.status,
        totalPemilih: assigned.length,
        laki: l,
        perempuan: p,
      };
    });

    return NextResponse.json({
      success: true,
      total: publicTps.length,
      data: publicTps,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memuat data sebaran TPS publik." },
      { status: 500 }
    );
  }
}
