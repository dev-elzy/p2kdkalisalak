import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function GET() {
  try {
    await dataStore.ensureSynced();
    const kandidatList = dataStore.getKandidatList();
    return NextResponse.json({
      success: true,
      data: kandidatList,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memuat data calon Kepala Desa." },
      { status: 500 }
    );
  }
}
