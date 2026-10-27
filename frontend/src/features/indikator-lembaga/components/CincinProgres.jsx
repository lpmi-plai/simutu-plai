import { isTargetTercapai } from "../utils";

/* Cincin progres menyesuaikan arah operasi target. */
const RADIUS = 52;
const KELILING = 2 * Math.PI * RADIUS;

export default function CincinProgres({
  capaian,
  target,
  operasiTarget = "≥",
  tone,
  besar = false,
  children,
}) {
  const valid =
    capaian != null &&
    target != null &&
    Number.isFinite(Number(capaian)) &&
    Number.isFinite(Number(target));

  const aktual = Number(capaian);
  const batas = Number(target);

  const operator = String(operasiTarget)
    .trim()
    .replaceAll("≥", ">=")
    .replaceAll("≤", "<=");

  // Untuk target minimum: progres = aktual / target.
  // Untuk target maksimum: progres = target / aktual.
  let rasio = 0;

  if (valid) {
    if (operator === "<=" || operator === "<") {
      rasio = aktual === 0 ? 1 : batas <= 0 ? 0 : batas / aktual;
    } else if (operator === "=" || operator === "==") {
      rasio = aktual === batas ? 1 : 0;
    } else {
      rasio = batas === 0 ? 1 : aktual / batas;
    }
  }

  rasio = Math.max(0, Math.min(1, rasio));

  const tercapai = valid && isTargetTercapai(aktual, batas, operasiTarget);

  const warnaCincin = tone.angka;

  return (
    <div className={`relative mx-auto ${besar ? "h-52 w-52" : "h-40 w-40"}`}>
      <svg
        viewBox="0 0 120 120"
        className={`h-full w-full -rotate-90 ${warnaCincin}`}
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          className="stroke-slate-200"
        />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={KELILING}
          strokeDashoffset={KELILING * (1 - rasio)}
          className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
