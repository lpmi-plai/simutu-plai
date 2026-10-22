import { useEffect, useState } from "react";
import FilterSelect from "../../components/ui/FilterSelect";
import TabelDokumen from "./components/TabelDokumen";
import { SEMUA_UNIT, mapDokumenApi } from "./data";

const API_URL = "http://127.0.0.1:8000";
const SEMUA_KATEGORI = "Semua kategori";
const SEMUA_STATUS = "Semua status";
const TANPA_KATEGORI = "Tanpa kategori";

const LABEL_STATUS = {
  lengkap: "Lengkap",
  belumLengkap: "Belum lengkap",
  belumDiunggah: "Belum diunggah",
};

export default function KetersediaanDokumenPage() {
  const [unitKerja, setUnitKerja] = useState(SEMUA_UNIT);
  const [kategori, setKategori] = useState(SEMUA_KATEGORI);
  const [status, setStatus] = useState(SEMUA_STATUS);
  const [dokumen, setDokumen] = useState([]);
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function ambilDokumen() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/ketersediaan/dokumen`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil data. HTTP ${response.status}`);
        }

        const result = await response.json();
        const dataApi = Array.isArray(result.data) ? result.data : [];

        setDokumen(dataApi.map(mapDokumenApi));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Gagal mengambil data dokumen.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    ambilDokumen();
    return () => controller.abort();
  }, []);

  const unitOpsi = [
    SEMUA_UNIT,
    ...new Set(dokumen.map((d) => d.unitKerja).filter(Boolean)),
  ];

  const kategoriOpsi = [
    SEMUA_KATEGORI,
    ...new Set(dokumen.map((d) => d.kategori || TANPA_KATEGORI)),
  ];

  const statusOpsi = [
    SEMUA_STATUS,
    "Lengkap",
    "Belum lengkap",
    "Belum diunggah",
  ];

  const tampil = dokumen.filter((d) => {
    const cocokUnit = unitKerja === SEMUA_UNIT || d.unitKerja === unitKerja;

    const kategoriDokumen = d.kategori || TANPA_KATEGORI;
    const cocokKategori =
      kategori === SEMUA_KATEGORI || kategoriDokumen === kategori;

    const cocokStatus =
      status === SEMUA_STATUS || LABEL_STATUS[d.status] === status;

    return cocokUnit && cocokKategori && cocokStatus;
  });

  async function simpanLink(id, link) {
    const linkBersih = link.trim();

    if (!linkBersih) {
      setPesan("Link dokumen tidak boleh kosong.");
      return false;
    }

    try {
      setPesan("");

      const response = await fetch(
        `${API_URL}/ketersediaan/dokumen/${id}/link`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ link_dokumen: linkBersih }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Gagal menyimpan link dokumen.");
      }

      setDokumen((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                linkDokumen: result.data.link_dokumen,
                status: result.data.link_dokumen?.trim()
                  ? "lengkap"
                  : "belumDiunggah",
              }
            : d,
        ),
      );

      setPesan("Link dokumen berhasil disimpan.");
      return true;
    } catch (err) {
      setPesan(err.message || "Gagal menyimpan link dokumen.");
      return false;
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h2 className="text-2xl font-semibold text-slate-900">
        Ketersediaan Dokumen
      </h2>

      <div className="mt-5 flex flex-wrap gap-4">
        <FilterSelect
          label="Unit kerja"
          value={unitKerja}
          onChange={setUnitKerja}
          options={unitOpsi}
        />

        <FilterSelect
          label="Kategori dokumen"
          value={kategori}
          onChange={setKategori}
          options={kategoriOpsi}
        />

        <FilterSelect
          label="Status kelengkapan"
          value={status}
          onChange={setStatus}
          options={statusOpsi}
        />
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-200 px-6 py-4 text-base font-medium text-slate-800">
          Daftar Dokumen
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({tampil.length} dokumen)
          </span>
        </h3>

        {loading ? (
          <p className="px-6 py-8 text-sm text-slate-500">
            Memuat data dokumen...
          </p>
        ) : error ? (
          <div className="px-6 py-8">
            <p className="text-sm text-red-600">{error}</p>
            <p className="mt-2 text-sm text-slate-500">
              Periksa koneksi backend dan alamat endpoint API.
            </p>
          </div>
        ) : (
          <TabelDokumen daftar={tampil} onSimpanLink={simpanLink} />
        )}
      </section>

      {pesan && (
        <p role="status" className="px-6 py-3 text-sm text-slate-600">
          {pesan}
        </p>
      )}
    </div>
  );
}
