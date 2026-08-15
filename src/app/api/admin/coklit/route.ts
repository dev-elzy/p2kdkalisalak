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
    const { searchParams } = new URL(req.url);
    let tps = searchParams.get("tps") || undefined;
    const status = searchParams.get("status") || undefined; // "ALL", "BELUM", "SESUAI", "UBAH_DATA", "TMS"
    const search = searchParams.get("search") || undefined;

    const user = session.user;
    const isOfficer = !user.isSuperAdmin && user.role !== "SUPER_ADMIN" && user.seksi !== "PIMPINAN";

    if (isOfficer && user.assignedTps && user.assignedTps !== "SEMUA") {
      tps = user.assignedTps;
    }

    let list = dataStore.getPemilihList({ tps, search });

    if (status && status !== "ALL") {
      if (status === "BELUM") {
        list = list.filter((p) => !p.coklitStatus || p.coklitStatus === "BELUM_COKLIT");
      } else {
        list = list.filter((p) => p.coklitStatus === status);
      }
    }

    const stats = dataStore.getCoklitStats(tps);

    return NextResponse.json({
      success: true,
      total: list.length,
      stats,
      data: list,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data Coklit lapangan." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = verifyAdminSession(req);
    if (!session.authenticated || !session.user) {
      return session.response!;
    }

    await dataStore.ensureSynced();
    const body = await req.json();
    const { voterId, status, catatan } = body;

    if (!voterId || !status) {
      return NextResponse.json(
        { success: false, message: "ID Pemilih dan Status Coklit wajib disertakan." },
        { status: 400 }
      );
    }

    const voter = dataStore.getPemilihById(voterId);
    if (!voter) {
      return NextResponse.json(
        { success: false, message: "Data pemilih tidak ditemukan." },
        { status: 404 }
      );
    }

    const user = session.user;
    const isOfficer = !user.isSuperAdmin && user.role !== "SUPER_ADMIN" && user.seksi !== "PIMPINAN";

    // Strict TPS protection for Pantarlih
    if (isOfficer && user.assignedTps && user.assignedTps !== "SEMUA" && !voter.tps.includes(user.assignedTps)) {
      return NextResponse.json(
        { success: false, message: `Akses Ditolak: Anda hanya berwenang mencoklit pemilih di ${user.assignedTps}.` },
        { status: 403 }
      );
    }

    const updated = dataStore.updateCoklitStatus(
      voterId,
      status,
      catatan || "",
      user.nama || user.username
    );

    return NextResponse.json({
      success: true,
      message: `Status Coklit untuk ${updated?.namaLengkap} berhasil diperbarui (${status}).`,
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status Coklit." },
      { status: 500 }
    );
  }
}
