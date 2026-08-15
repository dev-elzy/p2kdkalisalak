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
    const list = dataStore.getKandidatList();
    return NextResponse.json({
      success: true,
      total: list.length,
      data: list,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data kandidat calon kades." },
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
    const {
      nomorUrut,
      namaLengkap,
      gelarDepan,
      gelarBelakang,
      tempatTanggalLahir,
      pendidikanTerakhir,
      pekerjaan,
      tagline,
      visi,
      misi,
      programUnggulan,
      fotoUrl,
      warnaTema,
      statusVerifikasi,
    } = body;

    if (!nomorUrut || !namaLengkap || !visi) {
      return NextResponse.json(
        { success: false, message: "Nomor urut, nama lengkap, dan visi calon wajib diisi." },
        { status: 400 }
      );
    }

    const newKandidat = dataStore.addKandidat(
      {
        nomorUrut: Number(nomorUrut),
        namaLengkap: namaLengkap.toUpperCase(),
        gelarDepan: gelarDepan || "",
        gelarBelakang: gelarBelakang || "",
        tempatTanggalLahir: tempatTanggalLahir || "Tegal",
        pendidikanTerakhir: pendidikanTerakhir || "SMA/S1",
        pekerjaan: pekerjaan || "Wiraswasta",
        tagline: tagline || "",
        visi,
        misi: Array.isArray(misi) ? misi : [misi].filter(Boolean),
        programUnggulan: Array.isArray(programUnggulan) ? programUnggulan : [programUnggulan].filter(Boolean),
        fotoUrl: fotoUrl || "/images/kandidat-default.png",
        warnaTema: warnaTema || "#2563eb",
        statusVerifikasi: statusVerifikasi || "DITETAPKAN",
      },
      session.user.nama || session.user.username
    );

    return NextResponse.json({
      success: true,
      message: `Calon Kepala Desa No. ${newKandidat.nomorUrut} (${newKandidat.namaLengkap}) berhasil ditambahkan.`,
      data: newKandidat,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan calon kepala desa." },
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

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Kandidat wajib disertakan." },
        { status: 400 }
      );
    }

    const updated = dataStore.updateKandidat(id, updates, session.user.nama || session.user.username);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Data kandidat tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Profil Calon No. ${updated.nomorUrut} (${updated.namaLengkap}) berhasil diperbarui.`,
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui profil calon." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = verifyAdminSession(req);
    if (!session.authenticated || !session.user) {
      return session.response!;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Kandidat yang akan dihapus wajib disertakan." },
        { status: 400 }
      );
    }

    const success = dataStore.deleteKandidat(id, session.user.nama || session.user.username);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Data kandidat tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data calon kepala desa berhasil dihapus.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus kandidat." },
      { status: 500 }
    );
  }
}
