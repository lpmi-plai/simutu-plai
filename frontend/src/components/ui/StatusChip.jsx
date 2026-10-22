/* `tone` berisi { label, chip } */

export default function StatusChip({ tone }) {
  if (!tone || !tone.chip) {
    return (
      <span className="inline-flex items-center whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
        Belum tersedia
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone.chip}`}
    >
      {tone.label}
    </span>
  );
}
