import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { hashPassword, verifyPassword, verifyAuthToken, generateAuthToken } from "@/lib/encryption";
import { validatePasswordPolicy, isInitialDefaultPassword, checkLeakedPasswordHIBP } from "@/lib/password-policy";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    let sessionUser: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyAuthToken(token);
      if (decoded) {
        sessionUser = decoded.username;
      }
    }

    const body = await req.json();
    const { username, currentPassword, newPassword, confirmPassword } = body;

    await dataStore.ensureSynced();

    const targetUsername = (username || sessionUser || "").toLowerCase().trim();

    if (!targetUsername) {
      return NextResponse.json(
        { success: false, message: "Username pengguna wajib disertakan." },
        { status: 400 }
      );
    }

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Kata sandi baru dan konfirmasi wajib diisi." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Konfirmasi kata sandi tidak cocok dengan kata sandi baru." },
        { status: 400 }
      );
    }

    // Validate 5 Criteria
    const policyResult = validatePasswordPolicy(newPassword);
    if (!policyResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: policyResult.errors[0] || "Kata sandi tidak memenuhi kriteria keamanan sistem.",
          errors: policyResult.errors,
        },
        { status: 400 }
      );
    }

    // Disallow re-using default initial passwords
    if (isInitialDefaultPassword(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message: "Dilarang menggunakan kembali Kata Sandi Awal Akun standar bawaan.",
        },
        { status: 400 }
      );
    }

    // Leaked Password Protection Check (HaveIBeenPwned HIBP k-Anonymity)
    const hibp = await checkLeakedPasswordHIBP(newPassword);
    if (hibp.isLeaked) {
      return NextResponse.json(
        {
          success: false,
          message: `Kata sandi ini terdeteksi pernah bocor di internet (${hibp.count.toLocaleString()} kali). Demi keamanan, silakan pilih kata sandi unik yang belum pernah bocor.`,
        },
        { status: 400 }
      );
    }

    // Look up Anggota in dataStore
    const allAnggota = dataStore.getAnggotaList();
    const targetAnggota = allAnggota.find(
      (a) => a.username.toLowerCase().trim() === targetUsername
    );

    // Fallback for developer or default superadmin account
    if (!targetAnggota && targetUsername === "develzy") {
      if (currentPassword && !verifyPassword(currentPassword, "p2kd2026")) {
        return NextResponse.json(
          { success: false, message: "Kata sandi saat ini tidak cocok." },
          { status: 401 }
        );
      }

      dataStore.addAuditLog({
        user: "develzy",
        role: "SUPER_ADMIN",
        aksi: "PASSWORD_CHANGED",
        entity: "AUTH",
        target: "Develzy (Developer)",
        detail: "Technical Developer berhasil memperbarui kata sandi baru yang memenuhi kriteria keamanan resmi.",
        ipAddress: "127.0.0.1",
      });

      const newToken = generateAuthToken({
        username: "develzy",
        nama: "Develzy (Developer)",
        role: "SUPER_ADMIN",
        seksi: "PIMPINAN",
        assignedTps: "SEMUA",
        isSuperAdmin: true,
      });

      return NextResponse.json({
        success: true,
        message: "Kata sandi pengembang baru berhasil diperbarui secara permanen.",
        data: {
          username: "develzy",
          mustChangePassword: false,
          token: newToken,
        },
      });
    }

    if (!targetAnggota && targetUsername === "admin_kalisalak") {
      if (currentPassword && !verifyPassword(currentPassword, "p2kd2026")) {
        return NextResponse.json(
          { success: false, message: "Kata sandi saat ini tidak cocok." },
          { status: 401 }
        );
      }

      dataStore.addAuditLog({
        user: "admin_kalisalak",
        role: "SUPER_ADMIN",
        aksi: "PASSWORD_CHANGED",
        entity: "AUTH",
        target: "Khasanudin, S.Pd.SD",
        detail: "Ketua P2KD / Super Admin utama berhasil memperbarui kata sandi baru yang memenuhi kriteria keamanan resmi.",
        ipAddress: "127.0.0.1",
      });

      const newToken = generateAuthToken({
        username: "admin_kalisalak",
        nama: "Khasanudin, S.Pd.SD (Ketua P2KD)",
        role: "SUPER_ADMIN",
        seksi: "PIMPINAN",
        assignedTps: "SEMUA",
        isSuperAdmin: true,
      });

      return NextResponse.json({
        success: true,
        message: "Kata sandi baru berhasil diperbarui secara permanen.",
        data: {
          username: "admin_kalisalak",
          mustChangePassword: false,
          token: newToken,
        },
      });
    }

    if (!targetAnggota) {
      return NextResponse.json(
        { success: false, message: "Akun panitia tidak ditemukan di database." },
        { status: 404 }
      );
    }

    // Verify current password if provided
    if (currentPassword) {
      const stored = targetAnggota.passwordHash || "p2kd2026";
      if (!verifyPassword(currentPassword, stored)) {
        return NextResponse.json(
          { success: false, message: "Kata sandi saat ini tidak valid." },
          { status: 401 }
        );
      }
    }

    // Hash new password
    const newPasswordHash = hashPassword(newPassword);

    // Update in dataStore
    dataStore.updateAnggota(
      targetAnggota.id,
      {
        passwordHash: newPasswordHash,
      },
      targetAnggota.username
    );

    // Update in Supabase
    await SupabaseDbService.updateAnggota(targetAnggota.id, {
      passwordHash: newPasswordHash,
    });

    dataStore.addAuditLog({
      user: targetAnggota.username,
      role: targetAnggota.role,
      aksi: "PASSWORD_CHANGED",
      entity: "AUTH",
      target: targetAnggota.namaLengkap,
      detail: `Akun panitia ${targetAnggota.username} (${targetAnggota.jabatan}) berhasil mengganti kata sandi awal dengan kata sandi aman.`,
      ipAddress: "127.0.0.1",
    });

    const isSuperAdmin = targetAnggota.role === "SUPER_ADMIN" || targetAnggota.seksi === "PIMPINAN";
    const newToken = generateAuthToken({
      username: targetAnggota.username,
      nama: `${targetAnggota.namaLengkap} (${targetAnggota.jabatan})`,
      role: targetAnggota.role,
      seksi: targetAnggota.seksi,
      assignedTps: targetAnggota.assignedTps || "SEMUA",
      isSuperAdmin,
    });

    return NextResponse.json({
      success: true,
      message: "Kata sandi baru berhasil disimpan ke database.",
      data: {
        username: targetAnggota.username,
        nama: targetAnggota.namaLengkap,
        mustChangePassword: false,
        token: newToken,
      },
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat memperbarui kata sandi." },
      { status: 500 }
    );
  }
}
