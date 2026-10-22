export const PRODI_LIST = ["SDT", "AIRO", "RKS"];
export const SEMUA_PRODI = "Semua prodi";
export const PRODI_OPSI = [SEMUA_PRODI, ...PRODI_LIST];
export const PERIODE = ["2025/2026", "2026/2027"];

// Sesuaikan nama lengkap dengan nilai kolom evaluasi_indikator.prodi.
const PRODI_DB = {
  SDT: "Sains Data Terapan",
  AIRO: "Kecerdasan Buatan dan Robotik",
  RKS: "Rekayasa Keamanan Siber",
};

function normalisasiSatuan(satuanTarget) {
  const s = (satuanTarget ?? "").toLowerCase();
  return s.includes("persen") || s.includes("%") ? "persen" : "angka";
}

function normalisasiProdi(prodiDb) {
  if (prodiDb == null || prodiDb.trim() === "") {
    return SEMUA_PRODI;
  }

  const value = prodiDb.trim().toLowerCase();

  return (
    PRODI_LIST.find(
      (kode) =>
        kode.toLowerCase() === value || PRODI_DB[kode]?.toLowerCase() === value,
    ) ?? prodiDb
  );
}

// Menggabungkan baris API berdasarkan ID indikator.
export function mapIndikatorApi(dataApi) {
  const hasil = new Map();

  for (const row of dataApi) {
    if (!hasil.has(row.id)) {
      hasil.set(row.id, {
        id: row.id,
        nama: row.nama_tampilan,
        rujukan: row.kategori_rujukan,
        satuan: normalisasiSatuan(row.satuan_target),
        target: row.target == null ? null : Number(row.target),
        urutan: row.urutan,
        isShow: row.is_show,
        unitKerja: row.nama_unit,
        nilai: Object.fromEntries(PRODI_OPSI.map((p) => [p, null])),
        evaluasi: Object.fromEntries(PRODI_OPSI.map((p) => [p, null])),
      });
    }

    const indikator = hasil.get(row.id);

    // LEFT JOIN dapat menghasilkan baris tanpa evaluasi.
    if (row.evaluasi_id == null) continue;

    const kodeProdi = normalisasiProdi(row.prodi);

    indikator.nilai[kodeProdi] =
      row.actual_value == null ? null : Number(row.actual_value);

    indikator.evaluasi[kodeProdi] = {
      periode: row.periode,
      target: row.target_value == null ? null : Number(row.target_value),
      operasiTarget: row.operasi_target,
      persentase:
        row.achievement_percentage == null
          ? null
          : Number(row.achievement_percentage),
      status: row.evaluation_status,
    };
  }

  return [...hasil.values()];
}
