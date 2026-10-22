// Sumber data indikator untuk semua fitur (Indikator Lembaga, Evaluasi, dst).
// Sekarang dummy. Nanti ganti isi fungsi dengan fetch, tanda tangan fungsi tetap.

const INDIKATOR = [
  {
    id: "i1",
    kode: "IK-01",
    nama: "Rasio dosen tetap terhadap mahasiswa",
    unitKerja: "Prodi SDT",
    satuan: "%",
    target: 90,
    capaian: 94,
    bukti: "SK Pembagian Tugas Dosen",
  },
  {
    id: "i2",
    kode: "IK-02",
    nama: "Dosen berkualifikasi S3",
    unitKerja: "Prodi SDT",
    satuan: "%",
    target: 30,
    capaian: 22,
    bukti: "Rekap Ijazah Dosen",
  },
  {
    id: "i3",
    kode: "IK-03",
    nama: "Lulusan tepat waktu",
    unitKerja: "Prodi SDT",
    satuan: "%",
    target: 60,
    capaian: 61,
    bukti: "Laporan Kelulusan",
  },
  {
    id: "i4",
    kode: "IK-04",
    nama: "Publikasi jurnal terindeks per dosen",
    unitKerja: "Prodi SDT",
    satuan: "judul",
    target: 2,
    capaian: 1.4,
    bukti: "Daftar Publikasi Scopus/SINTA",
  },
  {
    id: "i5",
    kode: "IK-05",
    nama: "Kepuasan mahasiswa terhadap layanan",
    unitKerja: "Prodi RKS",
    satuan: "%",
    target: 80,
    capaian: 85,
    bukti: "Hasil Survei Kepuasan",
  },
  {
    id: "i6",
    kode: "IK-06",
    nama: "Kerja sama dengan mitra industri",
    unitKerja: "Prodi RKS",
    satuan: "mitra",
    target: 10,
    capaian: 7,
    bukti: "Daftar MoU Aktif",
  },
  {
    id: "i7",
    kode: "IK-07",
    nama: "Audit mutu internal terlaksana",
    unitKerja: "LPM",
    satuan: "%",
    target: 100,
    capaian: 100,
    bukti: "Laporan AMI",
  },
];

// TODO: GET /indikator?unitKerja=...&periode=...
// eslint-disable-next-line no-unused-vars

export function getIndikator({ unitKerja, periode }) {
  return INDIKATOR.filter((d) => {
    const cocokUnit =
      !unitKerja || unitKerja === "Keseluruhan" || d.unitKerja === unitKerja;

    return cocokUnit;
  });
}
