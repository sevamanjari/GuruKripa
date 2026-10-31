/**
 * Date Normalization Utility for GuruKripa Yatayat
 * Engineered by SevaManjari Labs Private Limited
 * Safely converts Indian date formats (DD/MM/YYYY, DD-MM-YYYY) into standard ISO (YYYY-MM-DD).
 */

export function normalizeDateToISO(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return dateStr || "";
  const clean = dateStr.trim();

  // Already standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const parts = clean.split(/[/.-]/);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (y.length === 4 && d.length <= 2 && m.length <= 2) {
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }

  return clean;
}
