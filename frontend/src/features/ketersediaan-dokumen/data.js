/* Konfigurasi halaman ketersediaan dokumen */

export const SEMUA_UNIT = "Semua unit kerja";

export const STATUS = {
  lengkap: {
    label: "Lengkap",
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  belumLengkap: {
    label: "Belum lengkap",
    chip: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  belumDiunggah: {
    label: "Belum diunggah",
    chip: "bg-rose-50 text-rose-800 ring-rose-200",
  },
};

/*
 * Mengubah format respons API menjadi format
 * yang digunakan oleh komponen tabel.
 */

export function mapDokumenApi(item) {
  const linkDokumen = item.link_dokumen ?? "";

  return {
    id: item.id,
    unitKerja: item.nama_unit,
    nama: item.nama_dokumen,
    kategori: item.kategori_dokumen ?? "",
    linkDokumen,
    status: linkDokumen.trim() ? "lengkap" : "belumDiunggah",
    tanggalUnggah: null,
  };
}
