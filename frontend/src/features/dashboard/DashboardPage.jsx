import { Fragment, useEffect, useMemo, useState } from "react";

const API_URL = "https://simutu-plai.onrender.com";

const UKURAN_HALAMAN = [5, 10, 25];
const KOLOM_ANGKA = ["total", "tercapai", "belumTercapai", "persentase"];

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

// Mengurutkan angka secara numerik dan teks menurut abjad Indonesia.
function urutkan(daftar, { kunci, arah }) {
  const faktor = arah === "asc" ? 1 : -1;

  return [...daftar].sort((a, b) => {
    const x = a[kunci];
    const y = b[kunci];

    if (typeof x === "number" && typeof y === "number") {
      return (x - y) * faktor;
    }

    return (
      String(x ?? "").localeCompare(String(y ?? ""), "id", {
        sensitivity: "base",
        numeric: true,
      }) * faktor
    );
  });
}

// Mengelola urutan dan halaman untuk satu tabel.
function useTabel(data, urutAwal, ukuranAwal = 5) {
  const [urut, setUrut] = useState(urutAwal);
  const [halaman, setHalaman] = useState(1);
  const [ukuran, setUkuran] = useState(ukuranAwal);

  const terurut = useMemo(() => urutkan(data, urut), [data, urut]);

  const totalHalaman = Math.max(1, Math.ceil(terurut.length / ukuran));
  const halamanAktif = Math.min(halaman, totalHalaman);

  const baris = useMemo(
    () => terurut.slice((halamanAktif - 1) * ukuran, halamanAktif * ukuran),
    [terurut, halamanAktif, ukuran],
  );

  function ubahUrut(kunci) {
    setUrut((sekarang) => {
      if (sekarang.kunci === kunci) {
        return { kunci, arah: sekarang.arah === "asc" ? "desc" : "asc" };
      }

      // Kolom angka paling berguna bila dimulai dari nilai terbesar.
      return { kunci, arah: KOLOM_ANGKA.includes(kunci) ? "desc" : "asc" };
    });
    setHalaman(1);
  }

  function ubahUkuran(nilai) {
    setUkuran(nilai);
    setHalaman(1);
  }

  return {
    baris,
    urut,
    ubahUrut,
    halaman: halamanAktif,
    setHalaman,
    totalHalaman,
    ukuran,
    ubahUkuran,
    jumlah: terurut.length,
  };
}

function IkonUrut({ arah }) {
  return (
    <svg
      viewBox="0 0 12 16"
      className="h-3.5 w-3"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M6 1 10.5 6h-9z"
        className={arah === "asc" ? "opacity-100" : "opacity-25"}
      />
      <path
        d="M6 15 1.5 10h9z"
        className={arah === "desc" ? "opacity-100" : "opacity-25"}
      />
    </svg>
  );
}

function KepalaUrut({
  label,
  kunci,
  urut,
  onUrut,
  rata = "kiri",
  className = "",
}) {
  const aktif = urut.kunci === kunci;
  const ariaSort = aktif
    ? urut.arah === "asc"
      ? "ascending"
      : "descending"
    : "none";

  const posisi = {
    kiri: "justify-start text-left",
    tengah: "justify-center text-center",
  }[rata];

  return (
    <th scope="col" aria-sort={ariaSort} className={`px-5 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onUrut(kunci)}
        title={`Urutkan berdasarkan ${label}`}
        className={`flex w-full items-center gap-1.5 rounded font-semibold hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${posisi} ${
          aktif ? "text-slate-900" : "text-slate-600"
        }`}
      >
        {label}
        <IkonUrut arah={aktif ? urut.arah : null} />
      </button>
    </th>
  );
}

function Paginasi({ tabel, satuan }) {
  const { halaman, setHalaman, totalHalaman, ukuran, ubahUkuran, jumlah } =
    tabel;

  if (jumlah === 0) return null;

  const awal = (halaman - 1) * ukuran + 1;
  const akhir = Math.min(halaman * ukuran, jumlah);

  const tombol =
    "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
      <p>
        Menampilkan {awal}–{akhir} dari {jumlah} {satuan}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span>Baris per halaman</span>
          <select
            value={ukuran}
            onChange={(e) => ubahUkuran(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
          >
            {UKURAN_HALAMAN.map((opsi) => (
              <option key={opsi} value={opsi}>
                {opsi}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={tombol}
            disabled={halaman <= 1}
            onClick={() => setHalaman(halaman - 1)}
          >
            Sebelumnya
          </button>

          <span className="min-w-24 text-center">
            Halaman {halaman} dari {totalHalaman}
          </span>

          <button
            type="button"
            className={tombol}
            disabled={halaman >= totalHalaman}
            onClick={() => setHalaman(halaman + 1)}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
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
  const [cariUnit, setCariUnit] = useState("");

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
          data.flatMap((item) =>
            (item.kategori_rujukan || "")
              .split(";")
              .map((value) => value.trim())
              .filter(Boolean),
          ),
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
          !kategoriRujukan ||
          (item.kategori_rujukan || "")
            .split(";")
            .map((value) => value.trim())
            .includes(kategoriRujukan);

        const cocokKategoriUnit =
          !kategoriUnit || item.kategori_unit === kategoriUnit;

        return cocokRujukan && cocokKategoriUnit;
      }),
    [data, kategoriRujukan, kategoriUnit],
  );

  const statistik = useMemo(() => hitungStatistik(dataTampil), [dataTampil]);
  // Ketercapaian berdasarkan kategori unit kerja.
  const statistikKategoriUnit = useMemo(() => {
    const kategoriUrutan = [
      "Akademik",
      "Non-Akademik",
      "Akademik & Non-Akademik",
    ];

    return kategoriUrutan
      .map((kategori) => {
        const daftar = dataTampil.filter(
          (item) =>
            (item.kategori_unit || "").trim().toLowerCase() ===
            kategori.toLowerCase(),
        );

        return {
          kategori,
          ...hitungStatistik(daftar),
        };
      })
      .filter((item) => item.total > 0);
  }, [dataTampil]);

  // Ketercapaian per unit kerja.
  const statistikUnit = useMemo(() => {
    const kelompok = new Map();

    dataTampil.forEach((item) => {
      const key = item.unit_id;

      if (!kelompok.has(key)) {
        kelompok.set(key, {
          id: key,
          unit: item.nama_unit || "Unit belum diisi",
          kategori: item.kategori_unit || "",
          daftar: [],
        });
      }

      kelompok.get(key).daftar.push(item);
    });

    return [...kelompok.values()].map((item) => ({
      ...item,
      ...hitungStatistik(item.daftar),
    }));
  }, [dataTampil]);

  // Pencarian nama unit kerja.
  const statistikUnitCocok = useMemo(() => {
    const kata = cariUnit.trim().toLowerCase();

    return kata
      ? statistikUnit.filter((item) => item.unit.toLowerCase().includes(kata))
      : statistikUnit;
  }, [statistikUnit, cariUnit]);

  // Ketercapaian per aspek, masing-masing membawa rincian per nama standar.
  const statistikAspek = useMemo(() => {
    const kelompok = new Map();

    dataTampil.forEach((item) => {
      const aspek = item.aspek_standar || "Aspek belum diisi";

      if (!kelompok.has(aspek)) {
        kelompok.set(aspek, { nama: aspek, daftar: [], standar: new Map() });
      }

      const grup = kelompok.get(aspek);
      grup.daftar.push(item);

      const idStandar = item.standard_id;

      if (!grup.standar.has(idStandar)) {
        grup.standar.set(idStandar, {
          id: idStandar,
          nama: item.nama_standar || "Standar belum diisi",
          daftar: [],
        });
      }

      grup.standar.get(idStandar).daftar.push(item);
    });

    return [...kelompok.values()].map((grup) => ({
      nama: grup.nama,
      ...hitungStatistik(grup.daftar),
      standar: [...grup.standar.values()].map((standar) => ({
        id: standar.id,
        nama: standar.nama,
        ...hitungStatistik(standar.daftar),
      })),
    }));
  }, [dataTampil]);

  const tabelUnit = useTabel(statistikUnitCocok, {
    kunci: "total",
    arah: "desc",
  });

  // Tabel aspek: urutan berlaku untuk aspek dan standar di dalamnya.
  const [urutAspek, setUrutAspek] = useState({ kunci: "total", arah: "desc" });
  const [aspekTerbuka, setAspekTerbuka] = useState(() => new Set());

  const aspekTerurut = useMemo(
    () =>
      urutkan(statistikAspek, urutAspek).map((aspek) => ({
        ...aspek,
        standar: urutkan(aspek.standar, urutAspek),
      })),
    [statistikAspek, urutAspek],
  );

  const semuaTerbuka =
    aspekTerurut.length > 0 &&
    aspekTerurut.every((aspek) => aspekTerbuka.has(aspek.nama));

  function ubahUrutAspek(kunci) {
    setUrutAspek((sekarang) =>
      sekarang.kunci === kunci
        ? { kunci, arah: sekarang.arah === "asc" ? "desc" : "asc" }
        : { kunci, arah: KOLOM_ANGKA.includes(kunci) ? "desc" : "asc" },
    );
  }

  function toggleAspek(nama) {
    setAspekTerbuka((sekarang) => {
      const baru = new Set(sekarang);

      if (baru.has(nama)) baru.delete(nama);
      else baru.add(nama);

      return baru;
    });
  }

  function toggleSemuaAspek() {
    setAspekTerbuka(
      semuaTerbuka ? new Set() : new Set(aspekTerurut.map((a) => a.nama)),
    );
  }

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
          label="Kategori Akademik / Non-Akademik"
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

          {/* Tingkat ketercapaian per kategori akademik / non akademik */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800">
                Tingkat Ketercapaian per Kategori Akademik / Non-Akademik
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Persentase indikator yang telah memenuhi target sesuai filter
                aktif.
              </p>
            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
              {statistikKategoriUnit.map((item) => (
                <div key={item.kategori} className="p-5">
                  <p className="text-sm font-medium text-slate-500">
                    {item.kategori}
                  </p>

                  <div className="mt-3 flex items-end justify-between gap-3">
                    <span className="text-3xl font-bold text-slate-900">
                      {item.persentase.toFixed(1)}%
                    </span>
                    <span className="pb-1 text-xs text-slate-500">
                      Ketercapaian
                    </span>
                  </div>

                  <div className="mt-4">
                    <ProgressBar persentase={item.persentase} />
                  </div>
                </div>
              ))}

              {statistikKategoriUnit.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500 md:col-span-3">
                  Tidak ada data pada filter yang dipilih.
                </div>
              )}
            </div>
          </section>

          {/* Ketercapaian per unit kerja */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 className="font-semibold text-slate-800">
                  Ketercapaian per Unit Kerja
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Klik judul kolom untuk mengurutkan.
                </p>
              </div>

              <label className="flex w-full flex-col gap-1.5 sm:w-64">
                <span className="text-xs font-semibold text-slate-500">
                  Cari unit kerja
                </span>
                <input
                  type="search"
                  value={cariUnit}
                  onChange={(e) => setCariUnit(e.target.value)}
                  placeholder="Ketik nama unit"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <KepalaUrut
                      label="Unit Kerja"
                      kunci="unit"
                      urut={tabelUnit.urut}
                      onUrut={tabelUnit.ubahUrut}
                    />
                    <KepalaUrut
                      label="Kategori"
                      kunci="kategori"
                      urut={tabelUnit.urut}
                      onUrut={tabelUnit.ubahUrut}
                    />
                    <KepalaUrut
                      label="Total"
                      kunci="total"
                      rata="tengah"
                      urut={tabelUnit.urut}
                      onUrut={tabelUnit.ubahUrut}
                    />
                    <KepalaUrut
                      label="Tercapai"
                      kunci="tercapai"
                      rata="tengah"
                      urut={tabelUnit.urut}
                      onUrut={tabelUnit.ubahUrut}
                    />
                    <KepalaUrut
                      label="Belum"
                      kunci="belumTercapai"
                      rata="tengah"
                      urut={tabelUnit.urut}
                      onUrut={tabelUnit.ubahUrut}
                    />
                    <KepalaUrut
                      label="Ketercapaian"
                      kunci="persentase"
                      className="min-w-48"
                      urut={tabelUnit.urut}
                      onUrut={tabelUnit.ubahUrut}
                    />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {tabelUnit.baris.map((item) => (
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

                  {tabelUnit.jumlah === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        {cariUnit
                          ? `Tidak ada unit kerja yang cocok dengan "${cariUnit}".`
                          : "Tidak ada data untuk filter yang dipilih."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Paginasi tabel={tabelUnit} satuan="unit kerja" />
          </section>

          {/* Ketercapaian per aspek, bisa dibuka untuk melihat tiap standar */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 className="font-semibold text-slate-800">
                  Ketercapaian per Aspek Standar
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Klik baris aspek untuk melihat nilai tiap nama standar.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleSemuaAspek}
                disabled={aspekTerurut.length === 0}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {semuaTerbuka ? "Tutup semua" : "Buka semua"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <KepalaUrut
                      label="Aspek / Nama Standar"
                      kunci="nama"
                      urut={urutAspek}
                      onUrut={ubahUrutAspek}
                    />
                    <KepalaUrut
                      label="Total"
                      kunci="total"
                      rata="tengah"
                      urut={urutAspek}
                      onUrut={ubahUrutAspek}
                    />
                    <KepalaUrut
                      label="Tercapai"
                      kunci="tercapai"
                      rata="tengah"
                      urut={urutAspek}
                      onUrut={ubahUrutAspek}
                    />
                    <KepalaUrut
                      label="Belum"
                      kunci="belumTercapai"
                      rata="tengah"
                      urut={urutAspek}
                      onUrut={ubahUrutAspek}
                    />
                    <KepalaUrut
                      label="Ketercapaian"
                      kunci="persentase"
                      className="min-w-48"
                      urut={urutAspek}
                      onUrut={ubahUrutAspek}
                    />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {aspekTerurut.map((aspek) => {
                    const terbuka = aspekTerbuka.has(aspek.nama);

                    return (
                      <Fragment key={aspek.nama}>
                        <tr
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => toggleAspek(aspek.nama)}
                        >
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              aria-expanded={terbuka}
                              className="flex items-center gap-2 rounded text-left font-semibold text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
                            >
                              <svg
                                viewBox="0 0 16 16"
                                className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                                  terbuka ? "rotate-90" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="m6 3 5 5-5 5" />
                              </svg>
                              {aspek.nama}
                              <span className="text-xs font-normal text-slate-500">
                                {aspek.standar.length} standar
                              </span>
                            </button>
                          </td>
                          <td className="px-5 py-4 text-center">
                            {aspek.total}
                          </td>
                          <td className="px-5 py-4 text-center font-semibold text-emerald-600">
                            {aspek.tercapai}
                          </td>
                          <td className="px-5 py-4 text-center font-semibold text-rose-600">
                            {aspek.belumTercapai}
                          </td>
                          <td className="px-5 py-4">
                            <ProgressBar persentase={aspek.persentase} />
                          </td>
                        </tr>

                        {terbuka &&
                          aspek.standar.map((standar) => (
                            <tr key={standar.id} className="bg-slate-50/70">
                              <td className="py-3 pl-14 pr-5 text-slate-700">
                                {standar.nama}
                              </td>
                              <td className="px-5 py-3 text-center">
                                {standar.total}
                              </td>
                              <td className="px-5 py-3 text-center font-semibold text-emerald-600">
                                {standar.tercapai}
                              </td>
                              <td className="px-5 py-3 text-center font-semibold text-rose-600">
                                {standar.belumTercapai}
                              </td>
                              <td className="px-5 py-3">
                                <ProgressBar persentase={standar.persentase} />
                              </td>
                            </tr>
                          ))}
                      </Fragment>
                    );
                  })}

                  {aspekTerurut.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        Tidak ada data aspek untuk filter yang dipilih.
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
