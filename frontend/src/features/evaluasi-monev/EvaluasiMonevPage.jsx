import { useState } from "react";
import FilterSelect from "../../components/ui/FilterSelect";
import { PERIODE, UNIT_KERJA } from "../../config/referensi";
import { getHasilAmi } from "../../services/amiApi";
import { getIndikator } from "../../services/indikatorApi";
import LaporanMonev from "./components/LaporanMonev";

export default function EvaluasiMonevPage() {
  const [unitKerja, setUnitKerja] = useState(UNIT_KERJA[0]);
  const [periode, setPeriode] = useState(PERIODE[0]);

  const daftar =
    unitKerja === "Keseluruhan"
      ? getIndikator({ periode })
      : getIndikator({ unitKerja, periode });

  const hasilAmi =
    unitKerja === "Keseluruhan" ? {} : getHasilAmi({ unitKerja, periode });

  function handlePrint() {
    window.print();
  }

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-slate-200 pb-4 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Evaluasi Monev
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Monitoring ketercapaian indikator mutu dan hasil audit.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M7 14h10v7H7z" />
                <path d="M17 11h.01" />
              </svg>
              Cetak laporan
            </button>
          </div>
        </header>

        <section className="mt-5 flex flex-wrap items-end gap-4 print:hidden">
          <FilterSelect
            label="Unit kerja"
            value={unitKerja}
            onChange={setUnitKerja}
            options={UNIT_KERJA}
          />

          <FilterSelect
            label="Periode"
            value={periode}
            onChange={setPeriode}
            options={PERIODE}
          />
        </section>

        <section className="mt-6 print:mt-0">
          <LaporanMonev
            unitKerja={unitKerja}
            periode={periode}
            daftar={daftar}
          />
        </section>
      </div>
    </main>
  );
}
