import { PRODI_LIST, SEMUA_PRODI } from "./data";

/* Status ditampilkan dengan teks + warna, bukan warna saja. */
export const TONE = {
  tercapai: {
    label: "Target tercapai",
    bar: "bg-emerald-600",
    angka: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  berjalan: {
    label: "Dalam proses",
    bar: "bg-amber-500",
    angka: "text-amber-700",
    chip: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  perhatian: {
    label: "Perlu perhatian",
    bar: "bg-rose-600",
    angka: "text-rose-700",
    chip: "bg-rose-50 text-rose-800 ring-rose-200",
  },
};

export function getTone(capaian, target) {
  const rasio = capaian / target;
  if (rasio >= 1) return TONE.tercapai;
  if (rasio >= 0.5) return TONE.berjalan;
  return TONE.perhatian;
}

export function formatNilai(n, satuan) {
  if (n == null || !Number.isFinite(n)) return "-";

  const nilai = Math.round(n);

  return satuan === "persen" ? `${nilai}%` : String(nilai);
}

/* Hitung capaian dan target untuk satu indikator sesuai filter prodi. */
export function hitung(indikator, prodi) {
  const kunci = prodi === SEMUA_PRODI ? PRODI_LIST : [prodi];
  const jumlah = kunci.reduce((total, k) => total + indikator.nilai[k], 0);

  if (indikator.satuan === "persen") {
    return {
      capaian: Math.round(jumlah / kunci.length),
      target: indikator.target,
    };
  }
  return { capaian: jumlah, target: indikator.target * kunci.length };
}
