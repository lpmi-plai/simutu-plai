import { useEffect } from "react";

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

export default function SumberData({ indikator, terbuka, onTutup }) {
  const sumberList = [indikator.dataSource, indikator.dataSource2].filter(
    Boolean,
  );

  // Tutup dengan Esc + kunci scroll body saat modal terbuka
  useEffect(() => {
    if (!terbuka) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onTutup();
    };
    document.addEventListener("keydown", onKeyDown);

    const overflowAwal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowAwal;
    };
  }, [terbuka, onTutup]);

  if (!terbuka) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onTutup}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-sumber-data"
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Sumber data</p>
            <h2
              id="judul-sumber-data"
              className="mt-0.5 break-words text-base font-semibold text-slate-800"
            >
              {indikator.nama}
            </h2>
          </div>

          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup"
            className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-3">
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
      </div>
    </div>
  );
}
