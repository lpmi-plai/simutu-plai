export const PRODI_LIST = ["SDT", "AIRO", "RKS"];
export const SEMUA_PRODI = "Semua prodi";
export const PRODI_OPSI = [SEMUA_PRODI, ...PRODI_LIST];
export const PERIODE = ["Keseluruhan", "2025/2026", "2026/2027"];

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

        // Sumber data utama.
        dataSource:
          row.sumber_data_id != null
            ? {
                id: row.sumber_data_id,
                spreadsheetName: row.spreadsheet_name,
                sheetName: row.sheet_name,
                spreadsheetUrl: row.spreadsheet_url,
              }
            : null,

        // Sumber data tambahan jika tersedia.
        dataSource2:
          row.sumber_data_id_2 != null
            ? {
                id: row.sumber_data_id_2,
                spreadsheetName: row.spreadsheet_name_2,
                sheetName: row.sheet_name_2,
                spreadsheetUrl: row.spreadsheet_url_2,
              }
            : null,

        nilai: Object.fromEntries(PRODI_OPSI.map((p) => [p, null])),
        evaluasi: Object.fromEntries(PRODI_OPSI.map((p) => [p, null])),

        // Riwayat nilai aktual dan target per periode.
        riwayat: {},
      });
    }

    const indikator = hasil.get(row.id);

    // Data indikator bisa tetap ada meskipun belum dievaluasi.
    if (row.evaluasi_id == null) continue;

    const kodeProdi = normalisasiProdi(row.prodi);
    const periodeRow = row.periode;

    if (!periodeRow) continue;

    if (!indikator.riwayat[periodeRow]) {
      indikator.riwayat[periodeRow] = {
        nilai: {},
        evaluasi: {},
      };
    }

    const aktual = row.actual_value == null ? null : Number(row.actual_value);

    const evaluasi = {
      periode: periodeRow,
      target: row.target_value == null ? null : Number(row.target_value),
      operasiTarget: row.operasi_target,
      persentase:
        row.achievement_percentage == null
          ? null
          : Number(row.achievement_percentage),
      status: row.evaluation_status,
    };

    indikator.riwayat[periodeRow].nilai[kodeProdi] = aktual;
    indikator.riwayat[periodeRow].evaluasi[kodeProdi] = evaluasi;
  }

  // Pertahankan nilai periode terbaru untuk ringkasan kartu.
  for (const indikator of hasil.values()) {
    const periodeTerurut = Object.keys(indikator.riwayat).sort();
    const periodeTerbaru = periodeTerurut.at(-1);

    if (!periodeTerbaru) continue;

    const dataTerbaru = indikator.riwayat[periodeTerbaru];

    for (const p of PRODI_LIST) {
      indikator.nilai[p] = dataTerbaru.nilai[p] ?? null;
      indikator.evaluasi[p] = dataTerbaru.evaluasi[p] ?? null;
    }
  }

  return [...hasil.values()];
}
