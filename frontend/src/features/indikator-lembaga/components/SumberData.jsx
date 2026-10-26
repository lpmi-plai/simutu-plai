import { useState } from "react";

function ItemSumber({ sumber, nomor }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 10h18M9 10v10M15 10v10" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">Sumber {nomor}</p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-800">
            {sumber.spreadsheetName || "Nama spreadsheet belum diisi"}
          </p>

          <p className="mt-1 break-words text-sm text-slate-600">
            Sheet: {sumber.sheetName || "Belum ditentukan"}
          </p>

          {sumber.spreadsheetUrl?.trim() ? (
            <a
              href={sumber.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Buka spreadsheet
              <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <p className="mt-2 text-sm text-amber-700">
              URL spreadsheet belum tersedia.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SumberData({ indikator }) {
  const [terbuka, setTerbuka] = useState(false);

  const sumberList = [indikator.dataSource, indikator.dataSource2].filter(
    Boolean,
  );

  return (
    <div className="mt-5 border-t border-slate-200 pt-3">
      <button
        type="button"
        onClick={() => setTerbuka((sebelumnya) => !sebelumnya)}
        aria-expanded={terbuka}
        className="flex w-full items-center justify-between gap-3 rounded-lg py-2 text-left text-sm font-medium text-slate-600 transition hover:text-blue-700"
      >
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <ellipse cx="12" cy="5" rx="8" ry="3" />
            <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
            <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
          </svg>
          Lihat sumber data
          {sumberList.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {sumberList.length}
            </span>
          )}
        </span>

        <span
          className={`transition-transform ${terbuka ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {terbuka && (
        <div className="mt-2 space-y-3">
          {sumberList.length > 0 ? (
            sumberList.map((sumber, index) => (
              <ItemSumber
                key={sumber.id ?? index}
                sumber={sumber}
                nomor={index + 1}
              />
            ))
          ) : (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
              Sumber data belum dihubungkan ke indikator ini.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
