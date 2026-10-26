import { formatNilai } from "../utils";

const LEBAR = 560;
const TINGGI = 290;
const MARGIN = { top: 32, right: 24, bottom: 58, left: 58 };

function agregasi(nilai, satuan) {
  const valid = nilai.filter((n) => n != null && Number.isFinite(n));

  if (!valid.length) return null;

  return satuan === "persen"
    ? valid.reduce((a, b) => a + b, 0) / valid.length
    : valid.reduce((a, b) => a + b, 0);
}

function ambilNilai(indikator, periode, prodi, jenis) {
  const data = indikator.riwayat[periode];
  if (!data) return null;

  if (prodi !== "Semua prodi") {
    if (jenis === "aktual") {
      return data.nilai?.[prodi] ?? null;
    }

    return data.evaluasi?.[prodi]?.target ?? indikator.target ?? null;
  }

  if (jenis === "aktual") {
    return agregasi(Object.values(data.nilai ?? {}), indikator.satuan);
  }

  const targets = Object.values(data.evaluasi ?? {})
    .map((e) => e?.target)
    .filter((n) => n != null && Number.isFinite(n));

  return targets.length
    ? agregasi(targets, indikator.satuan)
    : (indikator.target ?? null);
}

// Membuat segmen garis terpisah ketika ada nilai yang kosong.
function buatPath(data, key, x, y) {
  let path = "";
  let segmenTerbuka = false;

  data.forEach((item, i) => {
    const nilai = item[key];

    if (nilai == null || !Number.isFinite(nilai)) {
      segmenTerbuka = false;
      return;
    }

    path += `${segmenTerbuka ? " L" : " M"} ${x(i)} ${y(nilai)}`;
    segmenTerbuka = true;
  });

  return path;
}

export default function GrafikPeriode({ indikator, prodi }) {
  const periodeList = Object.keys(indikator.riwayat).sort();

  const data = periodeList.map((periode) => ({
    periode,
    aktual: ambilNilai(indikator, periode, prodi, "aktual"),
    target: ambilNilai(indikator, periode, prodi, "target"),
  }));

  const valid = data
    .flatMap((d) => [d.aktual, d.target])
    .filter((n) => n != null && Number.isFinite(n));

  if (!data.length || !valid.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        Belum ada data historis untuk ditampilkan.
      </p>
    );
  }

  const plotW = LEBAR - MARGIN.left - MARGIN.right;
  const plotH = TINGGI - MARGIN.top - MARGIN.bottom;

  const nilaiMin = Math.min(...valid);
  const nilaiMaks = Math.max(...valid);
  const rentangData = nilaiMaks - nilaiMin;

  // Beri ruang di sekitar data supaya perubahan kecil tetap terlihat.
  const padding = Math.max(
    rentangData * 0.2,
    indikator.satuan === "persen" ? 1 : Math.abs(nilaiMaks) * 0.05,
    0.5,
  );

  let min = Math.max(0, nilaiMin - padding);
  let maks = nilaiMaks + padding;

  // Persentase tidak boleh melewati rentang 0–100.
  if (indikator.satuan === "persen") {
    min = Math.max(0, min);
    maks = Math.min(100, maks);
  }

  if (maks <= min) {
    min = Math.max(0, nilaiMin - (indikator.satuan === "persen" ? 1 : 0.5));
    maks = nilaiMaks + (indikator.satuan === "persen" ? 1 : 0.5);
  }

  const rentang = maks - min || 1;

  const x = (i) =>
    MARGIN.left +
    (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);

  // Tentukan interval bilangan bulat yang sesuai dengan rentang data.
  const interval = Math.max(1, Math.ceil(rentang / 4));

  const batasMin = Math.max(0, Math.floor(min / interval) * interval);
  const batasMaks = Math.ceil(maks / interval) * interval;

  const skalaMin = indikator.satuan === "persen" ? batasMin : batasMin;
  const skalaMaks =
    indikator.satuan === "persen" ? Math.min(100, batasMaks) : batasMaks;

  const rentangSkala = skalaMaks - skalaMin || 1;

  const y = (v) => MARGIN.top + ((skalaMaks - v) / rentangSkala) * plotH;

  const ticks = [];
  for (let nilai = skalaMaks; nilai >= skalaMin; nilai -= interval) {
    ticks.push(nilai);
  }

  const pathAktual = buatPath(data, "aktual", x, y);
  const pathTarget = buatPath(data, "target", x, y);

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-5 rounded bg-blue-600" />
          Nilai aktual
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-5 rounded bg-amber-500" />
          Target
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${LEBAR} ${TINGGI}`}
          className="h-auto w-full min-w-[320px]"
          role="img"
          aria-label={`Grafik nilai aktual dan target ${indikator.nama} per periode`}
        >
          {ticks.map((tick, i) => (
            <g key={i}>
              <line
                x1={MARGIN.left}
                y1={y(tick)}
                x2={LEBAR - MARGIN.right}
                y2={y(tick)}
                stroke="#cbd5e1"
                strokeDasharray="3 4"
              />
              <text
                x={MARGIN.left - 8}
                y={y(tick) + 4}
                fontSize="11"
                fill="#64748b"
                textAnchor="end"
              >
                {formatNilai(tick, indikator.satuan)}
              </text>
            </g>
          ))}

          <path
            d={pathAktual}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          <path
            d={pathTarget}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {data.map((d, i) => (
            <g key={d.periode}>
              {d.aktual != null && (
                <g>
                  <circle cx={x(i)} cy={y(d.aktual)} r="4" fill="#2563eb" />
                  <text
                    x={x(i)}
                    y={y(d.aktual) - 10}
                    fontSize="11"
                    fontWeight="600"
                    fill="#2563eb"
                    textAnchor="middle"
                  >
                    {formatNilai(d.aktual, indikator.satuan)}
                  </text>
                  <title>
                    Aktual {d.periode}:{" "}
                    {formatNilai(d.aktual, indikator.satuan)}
                  </title>
                </g>
              )}

              {d.target != null && (
                <g>
                  <circle cx={x(i)} cy={y(d.target)} r="4" fill="#f59e0b" />
                  <text
                    x={x(i)}
                    y={y(d.target) + 16}
                    fontSize="11"
                    fontWeight="600"
                    fill="#b45309"
                    textAnchor="middle"
                  >
                    {formatNilai(d.target, indikator.satuan)}
                  </text>
                  <title>
                    Target {d.periode}:{" "}
                    {formatNilai(d.target, indikator.satuan)}
                  </title>
                </g>
              )}

              <text
                x={x(i)}
                y={TINGGI - MARGIN.bottom + 22}
                fontSize={data.length > 5 ? "10" : "11"}
                fill="#64748b"
                textAnchor="middle"
                transform={
                  data.length > 5
                    ? `rotate(-35 ${x(i)} ${TINGGI - MARGIN.bottom + 22})`
                    : undefined
                }
              >
                {d.periode}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
