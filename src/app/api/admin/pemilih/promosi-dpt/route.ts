import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ids, targetTahap = "DPT", user = "Petugas P2KD" } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "ID pemilih tidak valid atau kosong." },
        { status: 400 }
      );
    }

    const result = await SupabaseDbService.promotePemilihToDpt(ids, user, targetTahap);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui status tahap pemilih di server." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      targetTahap,
      message: `Berhasil memindahkan ${result.count} data pemilih ke ${targetTahap}.`,
    });
  } catch (err) {
    console.error("Error in POST /api/admin/pemilih/promosi-dpt:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
