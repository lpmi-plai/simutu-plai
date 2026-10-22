import { formatNilai, persen, tercapai } from "../../../utils/evaluasi";

export default function LaporanMonev({ unitKerja, periode, daftar }) {
  const jumlahTercapai = daftar.filter(tercapai).length;
  const jumlahBelumTercapai = daftar.length - jumlahTercapai;

  const persentaseTercapai =
    daftar.length > 0 ? Math.round((jumlahTercapai / daftar.length) * 100) : 0;

  const tanggalCetak = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article>
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Daftar Indikator
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {unitKerja} · Periode {periode}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="text-slate-600">
              Total: <strong className="text-slate-900">{daftar.length}</strong>
            </span>
            <span className="text-emerald-700">
              Tercapai: <strong>{jumlahTercapai}</strong>
            </span>
            <span className="text-rose-700">
              Belum tercapai: <strong>{jumlahBelumTercapai}</strong>
            </span>
            <span className="text-slate-600">
              Capaian:{" "}
              <strong className="text-slate-900">{persentaseTercapai}%</strong>
            </span>
          </div>
        </header>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[650px] border-collapse text-left text-sm print:min-w-0 print:text-[10px]">
            <thead className="bg-slate-50 text-slate-600 print:bg-slate-100">
              <tr>
                <th scope="col" className="w-12 px-4 py-3 font-medium">
                  No.
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Indikator
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Target
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Capaian
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Ketercapaian
                </th>
              </tr>
            </thead>

            <tbody>
              {daftar.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Tidak ada indikator untuk unit kerja dan periode ini.
                  </td>
                </tr>
              ) : (
                daftar.map((d, i) => {
                  const ok = tercapai(d);
                  const capaianPersen = persen(d.capaian, d.target);

                  return (
                    <tr
                      key={d.id}
                      className="border-t border-slate-200 align-top hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-4 text-slate-500">{i + 1}</td>

                      <td className="max-w-xs px-4 py-4">
                        <p className="font-medium leading-5 text-slate-900">
                          {d.nama}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Kode: {d.kode}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-600">
                        {formatNilai(d.target, d.satuan)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right font-medium tabular-nums text-slate-900">
                        {formatNilai(d.capaian, d.satuan)}
                      </td>

                      <td className="px-4 py-4">
                        <p
                          className={ok ? "text-emerald-700" : "text-rose-700"}
                        >
                          {ok ? "Tercapai" : "Belum tercapai"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {capaianPersen}% dari target
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Dokumen dihasilkan oleh Sistem Monitoring SPMI pada {tanggalCetak}.
        </footer>
      </section>
    </article>
  );
}
