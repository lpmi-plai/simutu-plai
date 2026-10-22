/* Cincin progres: terisi sesuai capaian / target, angka ada di tengah. */
const RADIUS = 52;
const KELILING = 2 * Math.PI * RADIUS;

export default function CincinProgres({
  capaian,
  target,
  tone,
  besar = false,
  children,
}) {
  const rasio = Math.min(1, capaian / target);
  return (
    <div className={`relative mx-auto ${besar ? "h-52 w-52" : "h-40 w-40"}`}>
      <svg
        viewBox="0 0 120 120"
        className={`h-full w-full -rotate-90 ${tone.angka}`}
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
