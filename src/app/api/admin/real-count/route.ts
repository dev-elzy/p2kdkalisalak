import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { verifyAdminSession } from "@/lib/auth-middleware";

export async function GET(req: Request) {
  try {
    const session = verifyAdminSession(req);
    if (!session.authenticated || !session.user) {
      return session.response!;
    }

    await dataStore.ensureSynced();
    const stats = dataStore.getRealCountStats();
    let tpsList = dataStore.getTpsVoteCounts();

    const user = session.user;
    const isOfficer = !user.isSuperAdmin && user.role !== "SUPER_ADMIN" && user.seksi !== "PIMPINAN";

    // If officer, only return their assigned TPS vote sheet
    if (isOfficer && user.assignedTps && user.assignedTps !== "SEMUA") {
      tpsList = tpsList.filter((t) => t.namaTps.includes(user.assignedTps) || t.nomorTps.includes(user.assignedTps.replace("TPS ", "")));
    }

    return NextResponse.json({
      success: true,
      stats,
      tpsData: tpsList,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data Real Count." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = verifyAdminSession(req);
    if (!session.authenticated || !session.user) {
      return session.response!;
    }

    const body = await req.json();
    const { nomorTps, suaraKandidat, suaraTidakSah, statusPlenoTps } = body;

    if (!nomorTps || !suaraKandidat) {
      return NextResponse.json(
        { success: false, message: "Nomor TPS dan rincian suara kandidat wajib diisi." },
        { status: 400 }
      );
    }

    const user = session.user;
    const isOfficer = !user.isSuperAdmin && user.role !== "SUPER_ADMIN" && user.seksi !== "PIMPINAN";

    // Role check: Officer can only submit for their assigned TPS
    if (isOfficer && user.assignedTps && user.assignedTps !== "SEMUA") {
      const formatted = nomorTps.toString().padStart(3, "0");
      if (!user.assignedTps.includes(formatted)) {
        return NextResponse.json(
          {
            success: false,
            message: `Akses Ditolak: Anda hanya berwenang menginput hasil suara untuk ${user.assignedTps}.`,
          },
          { status: 403 }
        );
      }
    }

    const updated = dataStore.updateTpsVoteCount(
      nomorTps,
      {
        suaraKandidat,
        suaraTidakSah: Number(suaraTidakSah) || 0,
        statusPlenoTps: statusPlenoTps || "SELESAI",
      },
      user.nama || user.username
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Data TPS tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Hasil pemungutan suara ${updated.namaTps} berhasil direkam (Total ${updated.suaraMasuk} Suara).`,
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan hasil pemungutan suara." },
      { status: 500 }
    );
  }
}
