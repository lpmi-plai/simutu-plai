import StatusChip from "../../../components/ui/StatusChip";
import { PRODI_LIST, SEMUA_PRODI } from "../data";
import { formatNilai, getTone, hitung } from "../utils";
import CincinProgres from "./CincinProgres";
import GrafikProdi from "./GrafikProdi";

/* Satu kartu per indikator: cincin ringkasan di kiri, chart per prodi di kanan. */
export default function KartuIndikator({
  indikator,
  prodi,
  utama = false,
  className = "",
}) {
  const { satuan } = indikator;
  const hasil = hitung(indikator, prodi);
  const tone = getTone(hasil.capaian, hasil.target);

  const semua = prodi === SEMUA_PRODI;
  const daftarProdi = semua ? PRODI_LIST : [prodi];
  const keterangan = !semua
    ? prodi
    : satuan === "persen"
      ? "Rata-rata"
      : "Total";

  return (
    <article
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
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
            ? "sm:grid-cols-[13rem_1fr] sm:gap-10"
            : "sm:grid-cols-[10rem_1fr] sm:gap-8 lg:grid-cols-1 lg:gap-6"
        }`}
      >
        <div>
          <CincinProgres
            capaian={hasil.capaian}
            target={hasil.target}
            tone={tone}
            besar={utama}
          >
            <span
              className={`font-bold leading-none tabular-nums ${tone.angka} ${utama ? "text-6xl" : "text-4xl"}`}
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

        <GrafikProdi indikator={indikator} daftarProdi={daftarProdi} />
      </div>
    </article>
  );
}
