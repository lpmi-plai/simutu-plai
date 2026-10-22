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
  const [periode, setPeriode] = useState(PERIODE[0]);
  const [prodi, setProdi] = useState(SEMUA_PRODI);

  useEffect(() => {
    const controller = new AbortController();

    async function ambilIndikator() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({ periode });

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

  const daftar = indikatorTampil
    .filter((d) => d.unitKerja === unitAktif)
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
          Belum ada indikator untuk unit kerja ini.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {daftar.map((indikator, i) => (
            <KartuIndikator
              key={indikator.id}
              indikator={indikator}
              prodi={prodi}
              utama={i === 0}
              className={i === 0 ? "lg:col-span-2" : ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}
