/**
 * Date formatting & normalization utilities for Indian Locale (DD/MM/YYYY)
 * Developed for SevaManjari Labs Private Limited / GuruKripa Yatayat
 */

/**
 * Converts ISO (YYYY-MM-DD) or Date object to Indian format DD/MM/YYYY
 * @param {string|Date} dateStr 
 * @returns {string} Formatted DD/MM/YYYY or original if invalid
 */
export function formatToIndianDate(dateStr) {
  if (!dateStr) return "";
  if (typeof dateStr !== "string") {
    if (dateStr instanceof Date && !isNaN(dateStr)) {
      const d = String(dateStr.getDate()).padStart(2, "0");
      const m = String(dateStr.getMonth() + 1).padStart(2, "0");
      const y = dateStr.getFullYear();
      return `${d}/${m}/${y}`;
    }
    return "";
  }

  const clean = dateStr.trim();
  // Already in DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(clean)) {
    return clean.replace(/-/g, "/");
  }

  // ISO format YYYY-MM-DD or ISO string with time
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const parts = clean.split("T")[0].split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
  }

  return clean;
}

/**
 * Converts Indian format (DD/MM/YYYY or DD-MM-YYYY) to ISO (YYYY-MM-DD)
 * @param {string} dateStr 
 * @returns {string} YYYY-MM-DD or original
 */
export function parseIndianDateToISO(dateStr) {
  if (!dateStr) return "";
  const clean = dateStr.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const parts = clean.split(/[/.-]/);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (y.length === 4 && d.length <= 2 && m.length <= 2) {
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }

  return clean;
}

/**
 * Validates whether string is a valid DD/MM/YYYY
 * @param {string} dateStr 
 * @returns {boolean}
 */
export function isValidIndianDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return false;
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}
