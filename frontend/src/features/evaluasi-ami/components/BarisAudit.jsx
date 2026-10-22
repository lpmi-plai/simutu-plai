import { formatNilai, persen } from "../../../utils/evaluasi";

const OPSI = [
  {
    nilai: "valid",
    label: "Valid",
    aktif: "border-emerald-600 bg-emerald-50 text-emerald-800",
  },
  {
    nilai: "tidak_valid",
    label: "Tidak valid",
    aktif: "border-rose-600 bg-rose-50 text-rose-800",
  },
];

export default function BarisAudit({ indikator, hasil, onUbah }) {
  const status = hasil?.status ?? "belum";
  const catatan = hasil?.catatan ?? "";
  const perluCatatan = status === "tidak_valid" && !catatan.trim();

  return (
    <tr className="border-t border-slate-200 align-top hover:bg-slate-50/50">
      <td className="px-4 py-4">
        <p className="text-xs text-slate-500">{indikator.kode}</p>
        <p className="mt-1 font-medium leading-6 text-slate-900">
          {indikator.nama}
        </p>
      </td>

      <td className="px-4 py-4 text-sm leading-6 text-slate-700">
        <p>Target: {formatNilai(indikator.target, indikator.satuan)}</p>
        <p>
          Capaian:{" "}
          <span className="font-medium text-slate-900">
            {formatNilai(indikator.capaian, indikator.satuan)}
          </span>{" "}
          <span className="text-slate-500">
            ({persen(indikator.capaian, indikator.target)}%)
          </span>
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Bukti: {indikator.bukti}
        </p>
      </td>

      <td className="px-4 py-4">
        <div
          role="radiogroup"
          aria-label={`Hasil validasi ${indikator.nama}`}
          className="flex flex-wrap gap-2"
        >
          {OPSI.map((o) => (
            <button
              key={o.nilai}
              type="button"
              role="radio"
              aria-checked={status === o.nilai}
              onClick={() => onUbah({ status: o.nilai, catatan })}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800 ${
                status === o.nilai
                  ? o.aktif
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </td>

      <td className="px-4 py-4">
        <label className="sr-only" htmlFor={`catatan-${indikator.id}`}>
          Catatan auditor untuk {indikator.nama}
        </label>

        <textarea
          id={`catatan-${indikator.id}`}
          rows={2}
          value={catatan}
          disabled={status === "belum"}
          onChange={(e) => onUbah({ status, catatan: e.target.value })}
          placeholder={
            status === "belum"
              ? "Pilih hasil validasi terlebih dahulu"
              : "Masukkan catatan auditor"
          }
          aria-invalid={perluCatatan}
          className={`w-full min-w-40 resize-y rounded-md border px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50 disabled:text-slate-500 ${
            perluCatatan ? "border-rose-400" : "border-slate-300"
          }`}
        />

        {perluCatatan && (
          <p className="mt-1 text-xs text-rose-700">Catatan wajib diisi.</p>
        )}
      </td>
    </tr>
  );
}
