import { useEffect, useMemo, useState } from "react";

const API_URL = "https://simutu-plai.onrender.com";

function isTercapai(item) {
  const status = String(item.evaluation_status || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

  // Status eksplisit dari hasil evaluasi.
  if (["tercapai", "terpenuhi", "sesuai_target", "achieved"].includes(status)) {
    return true;
  }

  if (
    [
      "belum_tercapai",
      "belum_terpenuhi",
      "tidak_tercapai",
      "belum_dievaluasi",
      "tidak_sesuai_target",
      "not_achieved",
    ].includes(status)
  ) {
    return false;
  }

  // Jika status belum tersedia, gunakan persentase sebagai fallback.
  const persentase = Number(item.achievement_percentage);

  return (
    item.achievement_percentage != null &&
    Number.isFinite(persentase) &&
    persentase >= 100
  );
}

function hitungStatistik(daftar) {
  const tercapai = daftar.filter(isTercapai).length;
  const total = daftar.length;

  return {
    total,
    tercapai,
    belumTercapai: total - tercapai,
    persentase: total ? (tercapai / total) * 100 : 0,
  };
}

function ProgressBar({ persentase }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, persentase))}%`,
          }}
        />
      </div>

      <span className="w-14 text-right font-semibold text-slate-700">
        {persentase.toFixed(1)}%
      </span>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex min-w-44 flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-500">{label}</span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
      >
        <option value="">Semua</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function KartuRingkasan({ judul, nilai, keterangan, warna }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{judul}</p>

      <p className={`mt-4 text-4xl font-bold ${warna}`}>{nilai}</p>

      <p className="mt-2 text-sm text-slate-500">{keterangan}</p>
    </article>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [periode, setPeriode] = useState("");
  const [kategoriRujukan, setKategoriRujukan] = useState("");
  const [kategoriUnit, setKategoriUnit] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function ambilDashboard() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (periode) {
          params.set("periode", periode);
        }

        const query = params.toString();
        const url = `${API_URL}/dashboard/ketercapaian${
          query ? `?${query}` : ""
        }`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil data dashboard. HTTP ${response.status}`,
          );
        }

        const result = await response.json();

        setData(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Gagal menghubungkan dashboard ke backend.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    ambilDashboard();

    return () => controller.abort();
  }, [periode]);

  // Pilihan filter diambil dari data API.
  const kategoriRujukanOpsi = useMemo(
    () =>
      [
        ...new Set(
          data
            .map((item) => item.kategori_rujukan)
            .filter((value) => value?.trim()),
        ),
      ].sort((a, b) => a.localeCompare(b, "id")),
    [data],
  );

  const kategoriUnitOpsi = useMemo(
    () =>
      [
        ...new Set(
          data
            .map((item) => item.kategori_unit)
            .filter((value) => value?.trim()),
        ),
      ].sort((a, b) => a.localeCompare(b, "id")),
    [data],
  );

  // Filter diterapkan ke semua bagian dashboard.
  const dataTampil = useMemo(
    () =>
      data.filter((item) => {
        const cocokRujukan =
          !kategoriRujukan || item.kategori_rujukan === kategoriRujukan;

        const cocokKategoriUnit =
          !kategoriUnit || item.kategori_unit === kategoriUnit;

        return cocokRujukan && cocokKategoriUnit;
      }),
    [data, kategoriRujukan, kategoriUnit],
  );

  const statistik = useMemo(() => hitungStatistik(dataTampil), [dataTampil]);

  // Ketercapaian per unit kerja.
  const statistikUnit = useMemo(() => {
    const kelompok = new Map();

    dataTampil.forEach((item) => {
      const key = item.unit_id;

      if (!kelompok.has(key)) {
        kelompok.set(key, {
          id: key,
          unit: item.nama_unit,
          kategori: item.kategori_unit,
          daftar: [],
        });
      }

      kelompok.get(key).daftar.push(item);
    });

    return [...kelompok.values()]
      .map((item) => ({
        ...item,
        ...hitungStatistik(item.daftar),
      }))
      .sort((a, b) => a.unit.localeCompare(b.unit, "id"));
  }, [dataTampil]);

  // Ketercapaian dikelompokkan menurut aspek dan nama standar.
  const statistikStandar = useMemo(() => {
    const kelompok = new Map();

    dataTampil.forEach((item) => {
      const aspek = item.aspek_standar || "Aspek belum diisi";
      const namaStandar = item.nama_standar || "Standar belum diisi";
      const key = `${aspek}::${item.standard_id}`;

      if (!kelompok.has(key)) {
        kelompok.set(key, {
          key,
          aspek,
          namaStandar,
          daftar: [],
        });
      }

      kelompok.get(key).daftar.push(item);
    });

    return [...kelompok.values()]
      .map((item) => ({
        ...item,
        ...hitungStatistik(item.daftar),
      }))
      .sort(
        (a, b) =>
          a.aspek.localeCompare(b.aspek, "id") ||
          a.namaStandar.localeCompare(b.namaStandar, "id"),
      );
  }, [dataTampil]);

  return (
    <main className="w-full space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard SPMI</h1>

        <p className="mt-1 text-sm text-slate-500">
          Ringkasan ketercapaian indikator mutu seluruh unit kerja.
        </p>
      </header>

      {/* Filter dashboard */}
      <section className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="flex min-w-44 flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-500">
            Periode evaluasi
          </span>

          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
          >
            <option value="">Evaluasi terbaru</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </label>

        <FilterSelect
          label="Kategori rujukan"
          value={kategoriRujukan}
          onChange={setKategoriRujukan}
          options={kategoriRujukanOpsi}
        />

        <FilterSelect
          label="Kategori unit kerja"
          value={kategoriUnit}
          onChange={setKategoriUnit}
          options={kategoriUnitOpsi}
        />
      </section>

      {loading ? (
        <p className="py-8 text-sm text-slate-500">Memuat data dashboard...</p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">Gagal memuat dashboard</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <p className="mt-2 text-sm text-slate-600">
            Periksa endpoint backend, koneksi Supabase, dan konfigurasi CORS.
          </p>
        </div>
      ) : (
        <>
          {/* Ringkasan keseluruhan */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KartuRingkasan
              judul="Total Indikator"
              nilai={statistik.total}
              keterangan="Sesuai filter aktif"
              warna="text-slate-900"
            />

            <KartuRingkasan
              judul="Tercapai"
              nilai={statistik.tercapai}
              keterangan="Indikator memenuhi target"
              warna="text-emerald-600"
            />

            <KartuRingkasan
              judul="Belum Tercapai"
              nilai={statistik.belumTercapai}
              keterangan="Termasuk yang belum dievaluasi"
              warna="text-rose-600"
            />
          </section>

          {/* Tingkat ketercapaian */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-800">
                  Tingkat Ketercapaian
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Persentase indikator yang tercapai.
                </p>
              </div>

              <span className="text-2xl font-bold text-emerald-600">
                {statistik.persentase.toFixed(1)}%
              </span>
            </div>

            <div className="mt-4">
              <ProgressBar persentase={statistik.persentase} />
            </div>
          </section>

          {/* Ketercapaian per unit kerja */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800">
                Ketercapaian per Unit Kerja
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Perbandingan ketercapaian pada setiap unit kerja.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3">Unit Kerja</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3 text-center">Total</th>
                    <th className="px-5 py-3 text-center">Tercapai</th>
                    <th className="px-5 py-3 text-center">Belum</th>
                    <th className="min-w-48 px-5 py-3">Ketercapaian</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {statistikUnit.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {item.unit}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {item.kategori || "-"}
                      </td>
                      <td className="px-5 py-4 text-center">{item.total}</td>
                      <td className="px-5 py-4 text-center font-semibold text-emerald-600">
                        {item.tercapai}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-rose-600">
                        {item.belumTercapai}
                      </td>
                      <td className="px-5 py-4">
                        <ProgressBar persentase={item.persentase} />
                      </td>
                    </tr>
                  ))}

                  {statistikUnit.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        Tidak ada data untuk filter yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Ketercapaian per aspek dan standar */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800">
                Ketercapaian per Aspek dan Standar
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pengelompokan berdasarkan aspek dan nama standar SPMI.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3">Aspek Standar</th>
                    <th className="px-5 py-3">Nama Standar</th>
                    <th className="px-5 py-3 text-center">Total</th>
                    <th className="px-5 py-3 text-center">Tercapai</th>
                    <th className="px-5 py-3 text-center">Belum</th>
                    <th className="min-w-48 px-5 py-3">Ketercapaian</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {statistikStandar.map((item) => (
                    <tr key={item.key} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {item.aspek}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {item.namaStandar}
                      </td>
                      <td className="px-5 py-4 text-center">{item.total}</td>
                      <td className="px-5 py-4 text-center font-semibold text-emerald-600">
                        {item.tercapai}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-rose-600">
                        {item.belumTercapai}
                      </td>
                      <td className="px-5 py-4">
                        <ProgressBar persentase={item.persentase} />
                      </td>
                    </tr>
                  ))}

                  {statistikStandar.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        Tidak ada data standar untuk filter yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
