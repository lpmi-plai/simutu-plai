import { useState } from "react";
import FilterSelect from "../../components/ui/FilterSelect";
import { PERIODE, UNIT_KERJA } from "../../config/referensi";
import { getHasilAmi, simpanHasilAmi } from "../../services/amiApi";
import { getIndikator } from "../../services/indikatorApi";
import { adaCatatanKosong, ringkasAmi } from "../../utils/evaluasi";
import TabelAudit from "./components/TabelAudit";

export default function EvaluasiAmiPage() {
  const [unitKerja, setUnitKerja] = useState(UNIT_KERJA[0]);
  const [periode, setPeriode] = useState(PERIODE[0]);
  const [hasil, setHasil] = useState(() =>
    getHasilAmi({
      unitKerja: UNIT_KERJA[0],
      periode: PERIODE[0],
    }),
  );
  const [pesan, setPesan] = useState("");

  const daftar =
    unitKerja === "Keseluruhan"
      ? getIndikator({ periode })
      : getIndikator({ unitKerja, periode });
  const ringkas = ringkasAmi(daftar, hasil);
  const terkunci = adaCatatanKosong(daftar, hasil);

  function gantiFilter(unitBaru, periodeBaru) {
    setUnitKerja(unitBaru);
    setPeriode(periodeBaru);
    setHasil(
      getHasilAmi({
        unitKerja: unitBaru,
        periode: periodeBaru,
      }),
    );
    setPesan("");
  }

  function ubah(id, nilai) {
    setHasil((prev) => ({ ...prev, [id]: nilai }));
    setPesan("");
  }

  function simpan() {
    simpanHasilAmi({ unitKerja, periode }, hasil);
    setPesan("Hasil AMI berhasil disimpan.");
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-semibold text-slate-900">Evaluasi AMI</h2>
        <p className="mt-1 text-sm text-slate-600">
          Evaluasi dan validasi hasil Audit Mutu Internal.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <FilterSelect
          label="Unit kerja"
          value={unitKerja}
          onChange={(v) => gantiFilter(v, periode)}
          options={UNIT_KERJA}
        />

        <FilterSelect
          label="Periode"
          value={periode}
          onChange={(v) => gantiFilter(unitKerja, v)}
          options={PERIODE}
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Daftar Indikator
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Periksa capaian dan bukti, lalu tentukan hasil validasi.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="text-slate-600">
              Total: <strong className="text-slate-900">{daftar.length}</strong>
            </span>
            <span className="text-emerald-700">
              Valid: <strong>{ringkas.valid}</strong>
            </span>
            <span className="text-rose-700">
              Tidak valid: <strong>{ringkas.tidak_valid}</strong>
            </span>
            <span className="text-slate-500">
              Belum diperiksa: <strong>{ringkas.belum}</strong>
            </span>
          </div>
        </div>

        <TabelAudit daftar={daftar} hasil={hasil} onUbah={ubah} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <div>
            {terkunci && (
              <p className="text-sm text-rose-700">
                Catatan wajib diisi untuk setiap indikator yang tidak valid.
              </p>
            )}

            {pesan && (
              <p role="status" className="text-sm text-emerald-700">
                {pesan}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={simpan}
            disabled={terkunci}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Simpan hasil AMI
          </button>
        </div>
      </section>
    </div>
  );
}
