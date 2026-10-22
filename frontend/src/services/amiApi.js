// Hasil validasi auditor AMI. Bentuk: { [idIndikator]: { status, catatan } }.
// Sekarang disimpan di memori (hilang saat reload). Nanti ganti dengan API.

const penyimpanan = {
  "Fakultas Teknik|2025/2026 Ganjil": {
    i1: { status: "valid", catatan: "" },
    i2: {
      status: "tidak_valid",
      catatan: "Ijazah 3 dosen belum terlampir pada rekap.",
    },
  },
};

const kunci = (unitKerja, periode) => `${unitKerja}|${periode}`;

// TODO: GET /ami?unitKerja=...&periode=...
export function getHasilAmi({ unitKerja, periode }) {
  return { ...(penyimpanan[kunci(unitKerja, periode)] ?? {}) };
}

// TODO: PUT /ami?unitKerja=...&periode=...
export function simpanHasilAmi({ unitKerja, periode }, hasil) {
  penyimpanan[kunci(unitKerja, periode)] = { ...hasil };
}
