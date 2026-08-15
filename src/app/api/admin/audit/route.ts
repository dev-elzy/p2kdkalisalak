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
    const logs = dataStore.getAuditLogs();
    return NextResponse.json({
      success: true,
      total: logs.length,
      data: logs,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memuat log audit aktivitas." },
      { status: 500 }
    );
  }
}
