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

export function formatNilai(n, satuan) {
  if (n == null || !Number.isFinite(n)) return "-";

  const nilai = Math.round(n);

  return satuan === "persen" ? `${nilai}%` : String(nilai);
}

/* Hitung capaian dan target untuk satu indikator sesuai filter prodi. */

export function hitung(indikator, prodi) {
  const semua = prodi === SEMUA_PRODI;
  const kunci = semua ? PRODI_LIST : [prodi];

  const satuan = (indikator.satuan ?? "").toLowerCase().trim();
  const gunakanRataRata = ["persen", "rasio"].includes(satuan);
  const operasiTarget = indikator.operasiTarget ?? "≥";

  const nilaiValid = kunci
    .map((p) => indikator.nilai[p])
    .filter((v) => v != null && Number.isFinite(Number(v)))
    .map(Number);

  const targetValid = kunci
    .map((p) => indikator.evaluasi[p]?.target ?? indikator.target)
    .filter((v) => v != null && Number.isFinite(Number(v)))
    .map(Number);

  const agregasi = (nilai) => {
    if (nilai.length === 0) return null;

    const total = nilai.reduce((a, b) => a + b, 0);

    return gunakanRataRata ? total / nilai.length : total;
  };

  const capaian = agregasi(nilaiValid);
  const target = agregasi(targetValid);

  return {
    capaian,
    target,
    operasiTarget,
  };
}

function normalisasiOperator(operasiTarget) {
  return String(operasiTarget ?? "≥")
    .trim()
    .replaceAll("≥", ">=")
    .replaceAll("≤", "<=");
}

export function isTargetTercapai(capaian, target, operasiTarget = "≥") {
  if (
    capaian == null ||
    target == null ||
    !Number.isFinite(Number(capaian)) ||
    !Number.isFinite(Number(target))
  ) {
    return false;
  }

  const aktual = Number(capaian);
  const batas = Number(target);
  const operator = normalisasiOperator(operasiTarget);

  switch (operator) {
    case ">=":
      return aktual >= batas;
    case ">":
      return aktual > batas;
    case "<=":
      return aktual <= batas;
    case "<":
      return aktual < batas;
    case "=":
    case "==":
      return aktual === batas;
    default:
      return aktual >= batas;
  }
}

export function getTone(capaian, target, operasiTarget = "≥") {
  if (capaian == null || target == null) {
    return TONE.perhatian;
  }

  if (isTargetTercapai(capaian, target, operasiTarget)) {
    return TONE.tercapai;
  }

  const operator = normalisasiOperator(operasiTarget);

  if (
    operator === "<=" ||
    operator === "<" ||
    operator === "=" ||
    operator === "=="
  ) {
    return TONE.perhatian;
  }

  const aktual = Number(capaian);
  const batas = Number(target);
  const rasio = batas > 0 ? aktual / batas : 0;

  return rasio >= 0.5 ? TONE.berjalan : TONE.perhatian;
}
