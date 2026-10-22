import BarisAudit from "./BarisAudit";

export default function TabelAudit({ daftar, hasil, onUbah }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Indikator
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Data capaian dan bukti
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Hasil validasi
            </th>
            <th scope="col" className="w-[260px] px-4 py-3 font-semibold">
              Catatan auditor
            </th>
          </tr>
        </thead>

        <tbody>
          {daftar.length > 0 ? (
            daftar.map((d) => (
              <BarisAudit
                key={d.id}
                indikator={d}
                hasil={hasil[d.id]}
                onUbah={(nilai) => onUbah(d.id, nilai)}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-10 text-center text-sm text-slate-500"
              >
                Tidak ada indikator untuk unit kerja dan periode ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
