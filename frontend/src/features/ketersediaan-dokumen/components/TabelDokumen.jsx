import { useState } from "react";
import StatusChip from "../../../components/ui/StatusChip";
import { STATUS } from "../data";
import { formatTanggal } from "../utils";

const KOLOM = [
  "No",
  "Unit Kerja",
  "Dokumen",
  "Kategori",
  "Status Kelengkapan",
  "Tanggal Unggah",
];

export default function TabelDokumen({ daftar, onSimpanLink }) {
  const [linkInput, setLinkInput] = useState({});
  const [sedangMenyimpan, setSedangMenyimpan] = useState({});
  const [pesanBaris, setPesanBaris] = useState({});

  async function kirimLink(dokumen) {
    const link = linkInput[dokumen.id] ?? dokumen.linkDokumen ?? "";

    setSedangMenyimpan((prev) => ({
      ...prev,
      [dokumen.id]: true,
    }));

    setPesanBaris((prev) => ({
      ...prev,
      [dokumen.id]: "",
    }));

    try {
      const berhasil = await onSimpanLink(dokumen.id, link);

      setPesanBaris((prev) => ({
        ...prev,
        [dokumen.id]: berhasil
          ? "Link berhasil disimpan."
          : "Link gagal disimpan.",
      }));
    } finally {
      setSedangMenyimpan((prev) => ({
        ...prev,
        [dokumen.id]: false,
      }));
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[75rem] text-left text-sm">
        <caption className="sr-only">
          Daftar dokumen beserta status kelengkapannya
        </caption>

        <thead className="border-b border-slate-200 text-slate-600">
          <tr>
            {KOLOM.map((k) => (
              <th key={k} scope="col" className="px-4 py-3 font-medium">
                {k}
              </th>
            ))}
            <th scope="col" className="min-w-80 px-4 py-3 font-medium">
              Link Dokumen
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {daftar.map((d, i) => {
            const link = linkInput[d.id] ?? d.linkDokumen ?? "";

            const menyimpan = Boolean(sedangMenyimpan[d.id]);

            return (
              <tr key={d.id}>
                <td className="w-14 px-4 py-3 tabular-nums text-slate-500">
                  {i + 1}
                </td>

                <td className="px-4 py-3 text-slate-700">{d.unitKerja}</td>

                <td className="px-4 py-3 font-medium text-slate-900">
                  {d.nama}
                </td>

                <td className="px-4 py-3 text-slate-700">{d.kategori}</td>

                <td className="px-4 py-3">
                  <StatusChip tone={STATUS[d.status] ?? STATUS.belumDiunggah} />
                </td>

                <td className="px-4 py-3 tabular-nums text-slate-700">
                  {formatTanggal(d.tanggalUnggah)}
                </td>

                <td className="px-4 py-3">
                  <div className="flex min-w-72 items-center gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) =>
                        setLinkInput((prev) => ({
                          ...prev,
                          [d.id]: e.target.value,
                        }))
                      }
                      placeholder="Tempel link dokumen..."
                      aria-label={`Link dokumen ${d.nama}`}
                      className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />

                    {/* {d.linkDokumen && (
                      <a
                        href={d.linkDokumen}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block max-w-xs truncate text-xs text-teal-700 underline hover:text-teal-900"
                        title={d.linkDokumen}
                      >
                        {d.linkDokumen}
                      </a>
                    )} */}

                    <button
                      type="button"
                      onClick={() => kirimLink(d)}
                      disabled={menyimpan || !link.trim()}
                      className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-teal-700 px-3 font-medium text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {menyimpan ? "Mengirim..." : "Kirim"}
                    </button>
                  </div>

                  {pesanBaris[d.id] && (
                    <p
                      role="status"
                      className={`mt-1 text-xs ${
                        pesanBaris[d.id].includes("berhasil")
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {pesanBaris[d.id]}
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
