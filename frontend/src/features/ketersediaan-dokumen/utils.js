/* Tanggal hari ini (zona waktu perangkat) dalam format YYYY-MM-DD. */
export function hariIni() {
  const d = new Date();
  const dua = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
}

/* "2026-09-12" -> "12 September 2026". Tanggal kosong ditampilkan "-". */
export function formatTanggal(iso) {
  if (!iso) return "-";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
