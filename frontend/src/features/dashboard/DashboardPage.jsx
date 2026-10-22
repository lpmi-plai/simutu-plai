import { useMemo } from "react";
import { UNIT_KERJA } from "../../config/referensi";
import { getIndikator } from "../../services/indikatorApi";

function hitungStatistik(daftar) {
  const total = daftar.length;
  const tercapai = daftar.filter(
    (item) => Number(item.capaian) >= Number(item.target),
  ).length;

  const belumTercapai = total - tercapai;

  return {
    total,
    tercapai,
    belumTercapai,
    persentase: total > 0 ? (tercapai / total) * 100 : 0,
  };
}

function KartuRingkasan({ judul, nilai, keterangan, warna, ikon }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{judul}</p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
          {ikon}
        </div>
      </div>

      <p className={`mt-5 text-5xl font-bold tracking-tight ${warna}`}>
        {nilai}
      </p>

      <p className="mt-3 text-sm text-slate-500">{keterangan}</p>
    </article>
  );
}

export default function DashboardPage() {
  const semuaIndikator = useMemo(
    () => getIndikator({ unitKerja: "Keseluruhan" }),
    [],
  );

  const statistik = hitungStatistik(semuaIndikator);

  const statistikUnit = UNIT_KERJA.filter((unit) => unit !== "Keseluruhan").map(
    (unit) => {
      const daftar = semuaIndikator.filter((item) => item.unitKerja === unit);

      return {
        unit,
        ...hitungStatistik(daftar),
      };
    },
  );

  return (
    <main className="w-full space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard SPMI</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan ketercapaian indikator mutu seluruh unit kerja.
        </p>
      </header>

      {/* Ringkasan keseluruhan */}
      <section className="space-y-4">
        {/* Fokus utama: persentase ketercapaian */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Tingkat Ketercapaian
              </p>

              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight text-emerald-600">
                  {statistik.persentase.toFixed(1)}%
                </span>

                <span className="text-sm text-slate-500">
                  dari seluruh indikator
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <svg
                className="h-7 w-7 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-5 5" />
              </svg>
            </div>
          </div>

          <div
            className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Persentase indikator tercapai"
            aria-valuenow={statistik.persentase}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${statistik.persentase}%`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-emerald-700">
              {statistik.tercapai} indikator tercapai
            </p>

            <p className="text-sm font-medium text-rose-600">
              {statistik.belumTercapai} belum tercapai
            </p>
          </div>
        </div>

        {/* Statistik pendukung */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <KartuRingkasan
            judul="Total Indikator"
            nilai={statistik.total}
            keterangan="Seluruh unit kerja"
            warna="text-slate-900"
            ikon={
              <svg
                className="h-5 w-5 text-slate-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 9h8M8 13h8M8 17h4" />
              </svg>
            }
          />

          <KartuRingkasan
            judul="Belum Tercapai"
            nilai={statistik.belumTercapai}
            keterangan="Indikator yang perlu ditindaklanjuti"
            warna="text-rose-600"
            ikon={
              <svg
                className="h-5 w-5 text-rose-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m15 9-6 6m0-6 6 6" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Persentase keseluruhan */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              Persentase Ketercapaian
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Proporsi indikator yang memenuhi target.
            </p>
          </div>

          <span className="text-2xl font-bold text-emerald-600">
            {statistik.persentase.toFixed(1)}%
          </span>
        </div>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Persentase indikator tercapai"
          aria-valuenow={statistik.persentase}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${statistik.persentase}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {statistik.tercapai} tercapai dari {statistik.total} indikator.
        </p>
      </section>

      {/* Statistik per unit */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800">
            Ketercapaian per Unit Kerja
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Perbandingan indikator tercapai dan belum tercapai pada setiap unit.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Unit Kerja</th>
                <th className="px-5 py-3 text-center font-semibold">Total</th>
                <th className="px-5 py-3 text-center font-semibold">
                  Tercapai
                </th>
                <th className="px-5 py-3 text-center font-semibold">
                  Belum Tercapai
                </th>
                <th className="min-w-48 px-5 py-3 font-semibold">
                  Ketercapaian
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {statistikUnit.map((item) => (
                <tr key={item.unit} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {item.unit}
                  </td>

                  <td className="px-5 py-4 text-center text-slate-700">
                    {item.total}
                  </td>

                  <td className="px-5 py-4 text-center font-semibold text-emerald-600">
                    {item.tercapai}
                  </td>

                  <td className="px-5 py-4 text-center font-semibold text-rose-600">
                    {item.belumTercapai}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${item.persentase}%`,
                          }}
                        />
                      </div>

                      <span className="w-14 text-right font-semibold text-slate-700">
                        {item.persentase.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {statistikUnit.every((item) => item.total === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Belum ada data indikator.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
