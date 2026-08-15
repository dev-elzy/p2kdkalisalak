import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { verifyAdminSession } from "@/lib/auth-middleware";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = verifyAdminSession(req);
    if (!session.authenticated || !session.user) {
      return session.response!;
    }

    await dataStore.ensureSynced();
    const { id } = await params;
    const body = await req.json();
    const { tpsBaru, rtBaru, rwBaru } = body;

    if (!tpsBaru) {
      return NextResponse.json(
        { success: false, message: "TPS tujuan mutasi wajib dipilih." },
        { status: 400 }
      );
    }

    const updated = dataStore.pindahTPS(
      id,
      tpsBaru,
      rtBaru || "01",
      rwBaru || "01",
      session.user.nama || session.user.username
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Data pemilih tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Pemilih berhasil dimutasi ke ${tpsBaru} (RT ${rtBaru || "01"}/RW ${rwBaru || "01"}).`,
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memproses mutasi pemilih." },
      { status: 500 }
    );
  }
}
