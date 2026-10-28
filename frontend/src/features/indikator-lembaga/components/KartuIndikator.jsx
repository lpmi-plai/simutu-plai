import { useState } from "react";

import StatusChip from "../../../components/ui/StatusChip";
import { PRODI_LIST, SEMUA_PRODI } from "../data";
import { formatNilai, getTone, hitung } from "../utils";
import CincinProgres from "./CincinProgres";
import GrafikProdi from "./GrafikProdi";
import GrafikPeriode from "./GrafikPeriode";
import SumberData from "./SumberData";

export default function KartuIndikator({
  indikator,
  prodi,
  periode,
  utama = false,
  className = "",
}) {
  const { satuan } = indikator;
  const hasil = hitung(indikator, prodi);
  const tone = getTone(hasil.capaian, hasil.target, hasil.operasiTarget);

  const [modalSumber, setModalSumber] = useState(false);

  // console.log("[DEBUG WARNA KARTU]", {
  //   nama: indikator.nama,
  //   prodi,
  //   targetIndikator: indikator.target,
  //   operasiTargetIndikator: indikator.operasiTarget,
  //   nilaiPerProdi: indikator.nilai,
  //   evaluasiPerProdi: indikator.evaluasi,
  //   hasilCapaian: hasil.capaian,
  //   hasilTarget: hasil.target,
  //   hasilOperasi: hasil.operasiTarget,
  //   warnaAngka: tone.angka,
  //   labelStatus: tone.label,
  // });

  const semua = prodi === SEMUA_PRODI;
  const daftarProdi = semua ? PRODI_LIST : [prodi];
  const keterangan = !semua
    ? prodi
    : satuan === "persen"
      ? "Rata-rata"
      : "Total";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => setModalSumber(true)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return; // abaikan tombol dari elemen anak
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setModalSumber(true);
        }
      }}
      aria-label={`Lihat sumber data ${indikator.nama}`}
      className={`cursor-pointer rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${className}`}
    >
      <div
        className={`relative ${
          utama
            ? "flex min-h-12 items-center justify-center text-center"
            : "flex items-start justify-between gap-3"
        }`}
      >
        <h3
          className={`font-medium text-slate-800 ${
            utama
              ? "px-16 text-2xl font-bold leading-snug sm:text-3xl"
              : "text-base"
          }`}
        >
          {indikator.nama}
        </h3>

        <div className={utama ? "absolute right-0 top-0" : ""}>
          <StatusChip tone={tone} />
        </div>
      </div>

      <div
        className={`mt-5 grid items-center gap-6 ${
          utama
            ? "sm:grid-cols-1 sm:gap-6"
            : "sm:grid-cols-[10rem_1fr] sm:gap-8 lg:grid-cols-1 lg:gap-6"
        }`}
      >
        <div
          className={`mt-5 grid items-center gap-6 ${
            periode === "Keseluruhan"
              ? utama
                ? "sm:grid-cols-[13rem_1fr] sm:gap-10"
                : "sm:grid-cols-[10rem_1fr] sm:gap-8 lg:grid-cols-1 lg:gap-6"
              : "grid-cols-1 gap-6"
          }`}
        >
          <div
            className={
              periode !== "Keseluruhan" && utama
                ? "flex flex-col items-center"
                : ""
            }
          >
            <CincinProgres
              capaian={hasil.capaian}
              target={hasil.target}
              operasiTarget={hasil.operasiTarget}
              tone={tone}
              besar={utama}
            >
              <span
                className={`font-bold leading-none tabular-nums ${tone.angka} ${
                  utama ? "text-6xl" : "text-4xl"
                }`}
              >
                {formatNilai(hasil.capaian, satuan)}
              </span>

              <span className="mt-1.5 text-sm tabular-nums text-slate-500">
                / {formatNilai(hasil.target, satuan)} target
              </span>
            </CincinProgres>

            <p className="mt-2 text-center text-sm text-slate-500">
              {keterangan}
            </p>
          </div>
          {periode === "Keseluruhan" ? (
            <GrafikPeriode indikator={indikator} prodi={prodi} />
          ) : (
            <GrafikProdi indikator={indikator} daftarProdi={daftarProdi} />
          )}
        </div>
      </div>

      <SumberData
        indikator={indikator}
        terbuka={modalSumber}
        onTutup={() => setModalSumber(false)}
      />
    </article>
  );
}
