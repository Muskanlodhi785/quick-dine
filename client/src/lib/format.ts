/** Convert "HH:mm" (24h) to a 12-hour display string, e.g. "18:00" -> "6:00 PM". */
export const formatTime12 = (time24?: string): string => {
  if (!time24) return "";
  const [hStr, m] = time24.split(":");
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return time24;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
};

/** Render a "YYYY-MM-DD" (or ISO) date in the local timezone without UTC shifting. */
export const formatDateShort = (isoDate?: string): string => {
  if (!isoDate) return "";
  const datePart = isoDate.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateLong = (isoDate?: string): string => {
  if (!isoDate) return "";
  const datePart = isoDate.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/** Today as a local "YYYY-MM-DD" string (matches <input type="date">). */
export const todayISO = (): string => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};
