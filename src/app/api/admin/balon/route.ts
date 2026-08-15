import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { verifyAdminSession } from "@/lib/auth-middleware";

// GET /api/admin/balon
export async function GET(req: Request) {
  try {
    const session = verifyAdminSession(req);
    if (!session.authenticated || !session.user) {
      return session.response!;
    }

    await dataStore.ensureSynced();
    const balonList = dataStore.getBalonList();
    return NextResponse.json({
      success: true,
      data: balonList,
      total: balonList.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data bakal calon Kades." },
      { status: 500 }
    );
  }
}

// POST /api/admin/balon - Pendaftaran Bakal Calon Baru
export async function POST(req: Request) {
  try {
    const session = verifyAdminSession(req);
    if (!session.authenticated || !session.user) {
      return session.response!;
    }

    const body = await req.json();
    const {
      namaLengkap,
      nik,
      tempatTanggalLahir,
      alamatDomisili,
      pendidikanTerakhir,
      pekerjaan,
      tanggalPendaftaran,
      statusBerkas = "BELUM_LENGKAP",
      kelengkapan,
      catatanPenjaringan,
    } = body;

    if (!namaLengkap || !nik) {
      return NextResponse.json(
        { success: false, message: "Nama lengkap dan NIK wajib diisi." },
        { status: 400 }
      );
    }

    const defaultKelengkapan = kelengkapan || {
      suratLamaran: true,
      ktpDanKk: true,
      ijazahLegalisir: false,
      skck: false,
      bebasNarkoba: false,
      keteranganSehat: false,
      keteranganPengadilan: false,
      pernyataanSetia: true,
    };

    const newBalon = dataStore.addBalon(
      {
        namaLengkap,
        nik,
        tempatTanggalLahir: tempatTanggalLahir || "Tegal, 01 Januari 1980",
        alamatDomisili: alamatDomisili || "Desa Kalisalak",
        pendidikanTerakhir: pendidikanTerakhir || "SMA Sederajat",
        pekerjaan: pekerjaan || "Wiraswasta",
        tanggalPendaftaran: tanggalPendaftaran || new Date().toLocaleDateString("id-ID"),
        statusBerkas,
        kelengkapan: defaultKelengkapan,
        catatanPenjaringan: catatanPenjaringan || "Pendaftaran awal berkas bakal calon Kepala Desa.",
      },
      session.user.nama || session.user.username
    );

    return NextResponse.json({
      success: true,
      message: "Pendaftaran bakal calon Kepala Desa berhasil dicatat.",
      data: newBalon,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mendaftarkan bakal calon." },
      { status: 500 }
    );
  }
}

// PUT /api/admin/balon - Update Verifikasi Berkas Persyaratan
export async function PUT(req: Request) {
  try {
    const session = verifyAdminSession(req);
    if (!session.authenticated || !session.user) {
      return session.response!;
    }

    const body = await req.json();
    const { id, kelengkapan, statusBerkas, catatanPenjaringan, ...otherFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID bakal calon wajib disertakan." },
        { status: 400 }
      );
    }

    const user = session.user.nama || session.user.username;

    if (kelengkapan || statusBerkas) {
      const updated = dataStore.updateStatusBerkasBalon(
        id,
        kelengkapan,
        statusBerkas,
        catatanPenjaringan,
        user
      );
      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Bakal calon tidak ditemukan." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Status kelengkapan berkas berhasil diverifikasi.",
        data: updated,
      });
    }

    const updated = dataStore.updateBalon(id, otherFields, user);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Bakal calon tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data bakal calon berhasil diperbarui.",
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data bakal calon." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/balon
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
        { success: false, message: "ID bakal calon wajib disertakan." },
        { status: 400 }
      );
    }

    const success = dataStore.deleteBalon(id, session.user.nama || session.user.username);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Bakal calon tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data bakal calon berhasil dihapus.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data bakal calon." },
      { status: 500 }
    );
  }
}
