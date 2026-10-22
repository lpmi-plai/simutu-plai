import { formatNilai, getTone } from "../utils";

/* Chart batang per prodi dengan garis putus-putus sebagai target. */
export default function GrafikProdi({ indikator, daftarProdi }) {
  const { satuan, target } = indikator;
  const semuaNilai = daftarProdi.map((p) => indikator.nilai[p]);
  // Skala diberi ruang ekstra supaya batang yang melewati target tetap muat.
  const skala =
    satuan === "persen" ? 100 : Math.max(target, ...semuaNilai) * 1.15;
  const posisiTarget = (target / skala) * 100;

  return (
    <div>
      <div className="relative">
        {/* Garis target. left-12 / right-14 menyamai lebar kolom label dan nilai di bawah. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-12 right-14"
          aria-hidden="true"
        >
          <div
            className="absolute -inset-y-1 border-l-2 border-dashed border-slate-700"
            style={{ left: `${posisiTarget}%` }}
          />
        </div>

        <ul className="space-y-2.5">
          {daftarProdi.map((p) => {
            const nilai = indikator.nilai[p];
            const tone = getTone(nilai, target);
            return (
              <li key={p} className="flex items-center text-sm">
                <span className="w-12 text-slate-600">{p}</span>
                <div
                  className="h-6 flex-1 overflow-hidden rounded bg-slate-100"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full rounded ${tone.bar} transition-[width] duration-500 motion-reduce:transition-none`}
                    style={{ width: `${(nilai / skala) * 100}%` }}
                  />
                </div>
                <span className="w-14 text-right font-medium tabular-nums text-slate-900">
                  {formatNilai(nilai, satuan)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span
          className="inline-block h-3 border-l-2 border-dashed border-slate-700"
          aria-hidden="true"
        />
        Target {formatNilai(target, satuan)} per prodi
      </p>
    </div>
  );
}
