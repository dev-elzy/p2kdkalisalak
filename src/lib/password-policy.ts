/**
 * password-policy.ts
 * Kebijakan & Validasi Standar Kata Sandi Resmi P2KD Pilkades Kalisalak
 * Kriteria Wajib:
 * 1. Panjang 8 - 16 karakter
 * 2. Minimal 1 huruf besar (A-Z)
 * 3. Minimal 1 huruf kecil (a-z)
 * 4. Minimal 1 angka (0-9)
 * 5. Minimal 1 karakter khusus (! @ # $ % ^ & * () _ + - =)
 */

export const DEFAULT_INITIAL_PASSWORDS = [
  "p2kd2026",
  "pantarlih123",
  "admin123",
  "password",
  "12345678",
  "kalisalak2026",
];

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 - 5
  rules: {
    length: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  errors: string[];
}

export function validatePasswordPolicy(password: string): PasswordValidationResult {
  const p = password || "";
  
  const rules = {
    length: p.length >= 8 && p.length <= 16,
    hasUppercase: /[A-Z]/.test(p),
    hasLowercase: /[a-z]/.test(p),
    hasNumber: /[0-9]/.test(p),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`\\"]/.test(p),
  };

  const errors: string[] = [];
  if (!rules.length) errors.push("Panjang kata sandi wajib 8 hingga 16 karakter.");
  if (!rules.hasUppercase) errors.push("Wajib mengandung minimal 1 huruf besar (A-Z).");
  if (!rules.hasLowercase) errors.push("Wajib mengandung minimal 1 huruf kecil (a-z).");
  if (!rules.hasNumber) errors.push("Wajib mengandung minimal 1 angka (0-9).");
  if (!rules.hasSpecial) errors.push("Wajib mengandung minimal 1 karakter khusus (! @ # $ % ^ & * () _ + - =).");

  let score = 0;
  if (rules.length) score++;
  if (rules.hasUppercase) score++;
  if (rules.hasLowercase) score++;
  if (rules.hasNumber) score++;
  if (rules.hasSpecial) score++;

  return {
    isValid: errors.length === 0,
    score,
    rules,
    errors,
  };
}

export function isInitialDefaultPassword(password: string): boolean {
  return DEFAULT_INITIAL_PASSWORDS.includes(password.trim());
}

/**
 * Memeriksa apakah kata sandi pernah bocor di database global (HaveIBeenPwned HIBP)
 * Menggunakan protokol privasi k-Anonymity (hanya 5 karakter pertama SHA-1 yang dikirim).
 */
export async function checkLeakedPasswordHIBP(password: string): Promise<{ isLeaked: boolean; count: number }> {
  try {
    if (!password) return { isLeaked: false, count: 0 };
    
    // Hash SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();

    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { isLeaked: false, count: 0 };
    }

    const text = await res.text();
    const lines = text.split("\n");
    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(":");
      if (hashSuffix && hashSuffix.toUpperCase() === suffix) {
        return { isLeaked: true, count: parseInt(countStr, 10) || 1 };
      }
    }
    return { isLeaked: false, count: 0 };
  } catch {
    // Fail gracefully if network / offline
    return { isLeaked: false, count: 0 };
  }
}
