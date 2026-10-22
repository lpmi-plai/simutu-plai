// Fungsi hitung bersama untuk Evaluasi Monev dan Evaluasi AMI.

export function persen(capaian, target) {
  if (!target) return 0;
  return Math.round((capaian / target) * 100);
}

export function tercapai(indikator) {
  return indikator.capaian >= indikator.target;
}

export function formatNilai(nilai, satuan) {
  const angka = Number.isInteger(nilai) ? nilai : nilai.toLocaleString("id-ID");
  return satuan === "%" ? `${angka}%` : `${angka} ${satuan}`;
}

export function statusAmi(hasil, id) {
  return hasil[id]?.status ?? "belum";
}

export function ringkasAmi(daftar, hasil) {
  const hitung = { valid: 0, tidak_valid: 0, belum: 0 };
  daftar.forEach((d) => {
    hitung[statusAmi(hasil, d.id)] += 1;
  });
  return hitung;
}

export function adaCatatanKosong(daftar, hasil) {
  return daftar.some(
    (d) =>
      hasil[d.id]?.status === "tidak_valid" && !hasil[d.id]?.catatan.trim(),
  );
}
