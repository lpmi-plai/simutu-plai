import { useEffect, useState } from "react";
import FilterSelect from "../../components/ui/FilterSelect";
import KartuIndikator from "./components/KartuIndikator";
import { PERIODE, PRODI_OPSI, SEMUA_PRODI, mapIndikatorApi } from "./data";

// const API_URL = "http://127.0.0.1:8000";
// const API_URL = "https://substantial-interior-nutten-dot.trycloudflare.com";
const API_URL = "https://simutu-plai.onrender.com";

export default function IndikatorLembagaPage() {
  const [indikatorList, setIndikatorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [unitKerja, setUnitKerja] = useState("");
  const [periode, setPeriode] = useState(PERIODE[PERIODE.length - 1]);
  const [prodi, setProdi] = useState(SEMUA_PRODI);
  const [cariIndikator, setCariIndikator] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function ambilIndikator() {
      try {
        setLoading(true);
        setError("");

        // const params = new URLSearchParams({ periode });
        const params = new URLSearchParams();

        if (periode !== "Keseluruhan") {
          params.set("periode", periode);
        }

        const response = await fetch(
          `${API_URL}/indikator-lembaga?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Gagal mengambil data. HTTP ${response.status}`);
        }

        const result = await response.json();
        const dataApi = Array.isArray(result.data) ? result.data : [];

        setIndikatorList(mapIndikatorApi(dataApi));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Gagal mengambil data indikator.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    ambilIndikator();

    return () => controller.abort();
  }, [periode]);

  const indikatorTampil = indikatorList.filter((d) => d.isShow);

  const unitOpsi = [...new Set(indikatorTampil.map((d) => d.unitKerja))].sort(
    (a, b) => a.localeCompare(b, "id"),
  );

  const unitAktif = unitOpsi.includes(unitKerja)
    ? unitKerja
    : (unitOpsi[0] ?? "");

  const kataKunci = cariIndikator.trim().toLocaleLowerCase("id");

  const daftar = indikatorTampil
    .filter((d) => d.unitKerja === unitAktif)
    .filter((d) => {
      if (!kataKunci) return true;

      return [d.nama, d.rujukan, d.unitKerja, d.id].some((nilai) =>
        String(nilai ?? "")
          .toLocaleLowerCase("id")
          .includes(kataKunci),
      );
    })
    .sort((a, b) => a.urutan - b.urutan);

  // function formatNamaUnit(namaUnit) {
  //   if (namaUnit === "Program Studi Sains Data Terapan") {
  //     return "Program Studi";
  //   }

  //   return namaUnit;
  // }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h2 className="text-2xl font-semibold text-slate-900">
        Indikator Lembaga
      </h2>

      <div className="sticky top-0 z-40 -mx-4 mt-4 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap gap-4">
          <FilterSelect
            label="Unit kerja"
            value={unitAktif}
            onChange={setUnitKerja}
            options={unitOpsi}
            formatOption={(nama) =>
              nama === "Program Studi Sains Data Terapan"
                ? "Program Studi"
                : nama
            }
          />

          <FilterSelect
            label="Periode"
            value={periode}
            onChange={setPeriode}
            options={PERIODE}
          />

          <FilterSelect
            label="Prodi"
            value={prodi}
            onChange={setProdi}
            options={PRODI_OPSI}
          />

          <div className="w-full sm:w-64">
            <label
              htmlFor="cari-indikator"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Cari indikator
            </label>

            <div className="relative">
              <input
                id="cari-indikator"
                type="search"
                value={cariIndikator}
                onChange={(e) => setCariIndikator(e.target.value)}
                placeholder="Nama atau kode indikator..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {cariIndikator && (
                <button
                  type="button"
                  onClick={() => setCariIndikator("")}
                  aria-label="Hapus pencarian"
                  className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-700"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Memuat data indikator...</p>
      ) : error ? (
        <div className="mt-8">
          <p className="text-sm text-red-600">{error}</p>
          <p className="mt-2 text-sm text-slate-500">
            Periksa koneksi backend dan alamat endpoint API.
          </p>
        </div>
      ) : daftar.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">
          {kataKunci
            ? `Tidak ditemukan indikator yang cocok dengan "${cariIndikator}" pada unit kerja ini.`
            : "Belum ada indikator untuk unit kerja ini."}
        </p>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {daftar.map((indikator, i) => (
            <KartuIndikator
              key={indikator.id}
              indikator={indikator}
              prodi={prodi}
              periode={periode}
              utama={i === 0}
              className={i === 0 ? "lg:col-span-2" : ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}
