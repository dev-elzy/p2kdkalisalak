/**
 * kalisalak-wilayah.ts
 * Master data & helper wilayah Desa Kalisalak (13 RW & 39 RT)
 * Pemetaan otomatis Tabung Pemilihan (TPS 01 - TPS 07)
 */

export interface WilayahRwItem {
  rw: string;
  label: string;
  rtList: string[];
  defaultTpsNomor: string;
  defaultTpsNama: string;
}

export const DAFTAR_RW_KALISALAK: { value: string; label: string; defaultTps: string }[] = [
  { value: "01", label: "RW 01", defaultTps: "01" },
  { value: "02", label: "RW 02", defaultTps: "01" },
  { value: "03", label: "RW 03", defaultTps: "02" },
  { value: "04", label: "RW 04", defaultTps: "02" },
  { value: "05", label: "RW 05", defaultTps: "03" },
  { value: "06", label: "RW 06", defaultTps: "03" },
  { value: "07", label: "RW 07", defaultTps: "04" },
  { value: "08", label: "RW 08", defaultTps: "04" },
  { value: "09", label: "RW 09", defaultTps: "05" },
  { value: "10", label: "RW 10", defaultTps: "05" },
  { value: "11", label: "RW 11", defaultTps: "06" },
  { value: "12", label: "RW 12", defaultTps: "06" },
  { value: "13", label: "RW 13", defaultTps: "07" },
];

export const DAFTAR_RT_KALISALAK: { value: string; label: string }[] = [
  { value: "01", label: "RT 01" },
  { value: "02", label: "RT 02" },
  { value: "03", label: "RT 03" },
];

/**
 * Normalisasi format string RW / RT ke format 2 digit (contoh: "1" -> "01", "RW 02" -> "02")
 */
export function normalizeWilayahCode(val: string | number | undefined | null): string {
  if (!val) return "01";
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return "01";
  const num = parseInt(digits, 10);
  if (isNaN(num)) return "01";
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Pemetaan otomatis Tabung Pemilihan (TPS) berdasarkan RW dan RT Desa Kalisalak
 * Pembagian Tabung TPS Resmi:
 * - TPS 01 / Tabung 01: RW 01 & RW 02
 * - TPS 02 / Tabung 02: RW 03 & RW 04
 * - TPS 03 / Tabung 03: RW 05 & RW 06
 * - TPS 04 / Tabung 04: RW 07 & RW 08
 * - TPS 05 / Tabung 05: RW 09 & RW 10
 * - TPS 06 / Tabung 06: RW 11 & RW 12
 * - TPS 07 / Tabung 07: RW 13 & Khusus
 */
export function getAutoTabungByRtRw(
  rwVal: string | number,
  rtVal?: string | number,
  availableTpsList?: Array<{ id?: string; nomorTps?: string; namaTps?: string; kodeTps?: string }>
): string {
  const cleanRw = normalizeWilayahCode(rwVal);
  const rwNum = parseInt(cleanRw, 10);

  let targetTpsNomor = "01";

  if (rwNum === 1 || rwNum === 2) targetTpsNomor = "01";
  else if (rwNum === 3 || rwNum === 4) targetTpsNomor = "02";
  else if (rwNum === 5 || rwNum === 6) targetTpsNomor = "03";
  else if (rwNum === 7 || rwNum === 8) targetTpsNomor = "04";
  else if (rwNum === 9 || rwNum === 10) targetTpsNomor = "05";
  else if (rwNum === 11 || rwNum === 12) targetTpsNomor = "06";
  else if (rwNum >= 13) targetTpsNomor = "07";
  else targetTpsNomor = "01";

  // Jika ada availableTpsList, sesuaikan nama resmi dari database TPS
  if (availableTpsList && availableTpsList.length > 0) {
    const numInt = parseInt(targetTpsNomor, 10);
    const matched = availableTpsList.find(
      (t) =>
        (t.nomorTps && (t.nomorTps === targetTpsNomor || parseInt(t.nomorTps, 10) === numInt)) ||
        (t.namaTps && (t.namaTps.includes(`0${numInt}`) || t.namaTps.includes(` ${numInt}`))) ||
        (t.kodeTps && (t.kodeTps.includes(`0${numInt}`) || t.kodeTps.includes(` ${numInt}`)))
    );
    if (matched && matched.namaTps) return matched.namaTps;
  }

  return `Tabung Pemilihan ${targetTpsNomor}`;
}
