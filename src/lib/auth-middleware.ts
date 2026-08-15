import { NextResponse } from "next/server";
import { verifyAuthToken, AuthTokenPayload } from "./encryption";

export interface SessionVerificationResult {
  authenticated: boolean;
  user?: AuthTokenPayload;
  response?: NextResponse;
}

/**
 * Validates admin request authentication token from Authorization header or cookie.
 */
export function verifyAdminSession(req: Request): SessionVerificationResult {
  let token: string | null = null;

  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  // 2. Check Cookie if header not present
  if (!token) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_token=([^;]+)/);
    if (match && match[1]) {
      token = match[1];
    }
  }

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "Akses Ditolak: Anda belum login atau tidak memiliki token otorisasi yang sah.",
        },
        { status: 401 }
      ),
    };
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          code: "INVALID_SESSION",
          message: "Akses Ditolak: Sesi Anda telah berakhir atau tanda tangan token tidak valid. Silakan login kembali.",
        },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    user: payload,
  };
}
