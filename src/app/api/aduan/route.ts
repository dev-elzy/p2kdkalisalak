import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function POST(req: Request) {
  try {
    await dataStore.ensureSynced();
    const body = await req.json();
    const { nama, nik, kontak, rt, rw, jenis, pesan, turnstileToken } = body;

    // Verify Cloudflare Turnstile Token (anti-spam form protection)
    const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (turnstileSecret && turnstileToken) {
      if (typeof turnstileToken === "string" && turnstileToken.length > 0) {
        try {
          const clientIp =
            req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            "";

          const cfRes = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              signal: AbortSignal.timeout(10000),
              body: new URLSearchParams({
                secret: turnstileSecret,
                response: turnstileToken,
                remoteip: clientIp,
              }),
            }
          );

          const cfData = await cfRes.json();
          if (!cfData.success) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "Verifikasi keamanan sistem gagal atau kadaluarsa. Silakan coba kembali.",
              },
              { status: 403 }
            );
          }
        } catch (err) {
          console.error("Turnstile error in /api/aduan:", err);
        }
      }
    }

    if (!nama || !nik || !kontak || !pesan) {
      return NextResponse.json(
        { success: false, message: "Seluruh kolom formulir wajib diisi." },
        { status: 400 }
      );
    }

    if (nik.length !== 16) {
      return NextResponse.json(
        { success: false, message: "NIK harus berjumlah 16 digit angka." },
        { status: 400 }
      );
    }

    const savedAduan = dataStore.addAduan({
      nama,
      nik,
      kontak,
      rt: rt || "01",
      rw: rw || "01",
      jenis: jenis || "BELUM_TERDAFTAR",
      pesan,
    });

    return NextResponse.json({
      success: true,
      message: "Laporan aduan berhasil diterima oleh Sekretariat P2KD Kalisalak.",
      data: {
        ticketNo: savedAduan.nomorAduan,
        nama: savedAduan.namaPelapor,
        nikMasked: savedAduan.nikMasked,
        kontak: savedAduan.kontakPelapor,
        rt: savedAduan.rt,
        rw: savedAduan.rw,
        jenis: savedAduan.jenisAduan,
        tanggalPengajuan: savedAduan.tanggal,
        status: savedAduan.status,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan laporan aduan." },
      { status: 500 }
    );
  }
}
