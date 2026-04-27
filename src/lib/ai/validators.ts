/**
 * Indian document format validators.
 * Includes real Verhoeff checksum for Aadhaar validation.
 * No external dependencies.
 */

// ---- Verhoeff Checksum Algorithm for Aadhaar ----

const VERHOEFF_D: readonly number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
] as const;

const VERHOEFF_P: readonly number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
] as const;

// Inverse table kept for reference — used in checksum generation (not needed for validation)
// const VERHOEFF_INV: readonly number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9] as const;

function verhoeffChecksum(num: string): boolean {
  let c = 0;
  const digits = num.split("").reverse().map(Number);
  for (let i = 0; i < digits.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digits[i]]];
  }
  return c === 0;
}

// ---- Validators ----

/** PAN: 5 uppercase letters, 4 digits, 1 uppercase letter */
export function isValidPAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase());
}

/** Aadhaar: 12 digits with valid Verhoeff checksum, cannot start with 0 or 1 */
export function isValidAadhaar(aadhaar: string): boolean {
  const cleaned = aadhaar.replace(/\s/g, "");
  if (!/^\d{12}$/.test(cleaned)) return false;
  if (cleaned[0] === "0" || cleaned[0] === "1") return false;
  return verhoeffChecksum(cleaned);
}

/**
 * Indian Driving License: state code (2 letters) + optional hyphen +
 * 2-digit RTO code + optional hyphen + 4-digit year or 7-digit number.
 * Common formats: KA-01-2020-0001234, DL0420190000001, KA0120200001234
 */
export function isValidDLNumber(dl: string): boolean {
  const cleaned = dl.replace(/[-\s]/g, "").toUpperCase();
  // Broad pattern: 2 letter state + 2 digit RTO + remaining digits (7-13 total after state+RTO)
  return /^[A-Z]{2}\d{2}\d{7,13}$/.test(cleaned);
}

/**
 * Indian Vehicle Registration: XX-00-XX-0000 or XX-00-X-0000 pattern
 * e.g., KA-01-AB-1234, MH-12-A-1234
 */
export function isValidVehicleReg(reg: string): boolean {
  const cleaned = reg.replace(/[-\s]/g, "").toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(cleaned);
}

/** Check if a date string (YYYY-MM-DD) is in the past */
export function isExpired(dateStr: string): boolean {
  const expiry = new Date(dateStr);
  if (isNaN(expiry.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry < today;
}

/** Number of days until a date. Negative means already expired. */
export function daysUntilExpiry(dateStr: string): number {
  const expiry = new Date(dateStr);
  if (isNaN(expiry.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/** Check if a date expires within N days */
export function isExpiringWithin(dateStr: string, days: number): boolean {
  const remaining = daysUntilExpiry(dateStr);
  return remaining >= 0 && remaining <= days;
}
