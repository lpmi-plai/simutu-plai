# Database Schema — Sistem Monitoring SPMI

## 1. Gambaran Umum

Database ini digunakan untuk mendukung aplikasi monitoring Sistem Penjaminan Mutu Internal (SPMI), mulai dari pengelolaan unit kerja dan standar, pendefinisian indikator, pengelolaan sumber data, ketersediaan dokumen, hingga evaluasi ketercapaian target indikator.

Database menggunakan PostgreSQL pada Supabase.

### 1.1 Daftar Tabel

| No. | Tabel                  | Fungsi                                                               |
| --: | ---------------------- | -------------------------------------------------------------------- |
|   1 | `unit_kerja`           | Menyimpan data unit kerja.                                           |
|   2 | `standar`              | Menyimpan standar SPMI.                                              |
|   3 | `sumber_data`          | Menyimpan informasi sumber data spreadsheet.                         |
|   4 | `indikator`            | Menyimpan definisi indikator, target, dan konfigurasi sumber data.   |
|   5 | `ketersediaan_dokumen` | Menyimpan daftar dokumen yang harus tersedia pada setiap unit kerja. |
|   6 | `indikator_to_dokumen` | Menghubungkan indikator dengan dokumen yang diperlukan.              |
|   7 | `evaluasi_indikator`   | Menyimpan hasil evaluasi ketercapaian indikator per periode.         |

### 1.2 Konvensi Database

- Semua tabel menggunakan kolom `id` bertipe `integer` dengan identity untuk menghasilkan ID secara otomatis, kecuali tabel penghubung `indikator_to_dokumen`.
- Primary key digunakan untuk mengidentifikasi setiap record.
- Foreign key menjaga hubungan antartabel.
- Kolom `created_at` dan `updated_at` digunakan untuk mencatat waktu pembuatan dan pembaruan data pada tabel yang memilikinya.
- Kolom `is_active` atau `is_show` digunakan untuk mengatur status aktif atau visibilitas data sesuai fungsinya.

---

## 2. Tabel `unit_kerja`

### Fungsi

Menyimpan informasi unit kerja yang menjadi dasar pengelolaan indikator, sumber data, dan dokumen SPMI.

### Struktur Kolom

| Kolom           | Tipe Data    | Null  | Default  | Keterangan                           |
| --------------- | ------------ | ----- | -------- | ------------------------------------ |
| `id`            | integer      | Tidak | Identity | Primary key.                         |
| `nama_unit`     | varchar(255) | Tidak | —        | Nama unit kerja.                     |
| `jenis_unit`    | varchar(100) | Ya    | —        | Jenis unit kerja.                    |
| `kategori_unit` | varchar(100) | Ya    | —        | Kategori akademik atau non-akademik. |
| `is_active`     | boolean      | Tidak | `true`   | Status aktif unit kerja.             |
| `created_at`    | timestamptz  | Tidak | `now()`  | Waktu pembuatan record.              |
| `updated_at`    | timestamptz  | Tidak | `now()`  | Waktu pembaruan record.              |

### Constraint

- Primary key: `id`
- Check constraint: `chk_kategori_unit`

Nilai `kategori_unit` yang diperbolehkan:

- `Akademik`
- `Non-Akademik`
- `Akademik & Non-Akademik`

### Trigger

- `trg_unit_kerja_updated_at`: dijalankan sebelum pembaruan data untuk memanggil fungsi `set_updated_at()`.

---

## 3. Tabel `standar`

### Fungsi

Menyimpan informasi standar SPMI yang menjadi acuan dalam penyusunan indikator.

### Struktur Kolom

| Kolom           | Tipe Data    | Null  | Default  | Keterangan                   |
| --------------- | ------------ | ----- | -------- | ---------------------------- |
| `id`            | integer      | Tidak | Identity | Primary key.                 |
| `kode_standar`  | varchar(100) | Tidak | —        | Kode unik standar.           |
| `aspek_standar` | varchar(255) | Tidak | —        | Aspek atau kelompok standar. |
| `nama_standar`  | varchar(255) | Tidak | —        | Nama standar.                |
| `versi`         | varchar(50)  | Ya    | —        | Versi standar.               |
| `is_active`     | boolean      | Tidak | `true`   | Status aktif standar.        |
| `created_at`    | timestamptz  | Tidak | `now()`  | Waktu pembuatan record.      |
| `updated_at`    | timestamptz  | Tidak | `now()`  | Waktu pembaruan record.      |

### Constraint

- Primary key: `id`
- Unique: `kode_standar`

### Trigger

- `trg_standar_updated_at`: memperbarui waktu perubahan melalui fungsi `set_updated_at()`.

---

## 4. Tabel `sumber_data`

### Fungsi

Menyimpan informasi spreadsheet dan worksheet yang menjadi sumber data indikator.

### Struktur Kolom

| Kolom              | Tipe Data    | Null  | Default              | Keterangan                   |
| ------------------ | ------------ | ----- | -------------------- | ---------------------------- |
| `id`               | integer      | Tidak | Identity             | Primary key.                 |
| `unit_id`          | integer      | Tidak | —                    | Referensi ke unit kerja.     |
| `spreadsheet_name` | varchar(255) | Ya    | —                    | Nama spreadsheet.            |
| `spreadsheet_url`  | text         | Ya    | —                    | URL spreadsheet.             |
| `sheet_name`       | varchar(255) | Tidak | —                    | Nama worksheet.              |
| `last_synced_at`   | timestamptz  | Ya    | —                    | Waktu sinkronisasi terakhir. |
| `sync_status`      | varchar(50)  | Tidak | `belum_disinkronkan` | Status sinkronisasi.         |
| `is_active`        | boolean      | Tidak | `true`               | Status aktif sumber data.    |
| `created_at`       | timestamptz  | Tidak | `now()`              | Waktu pembuatan record.      |
| `updated_at`       | timestamptz  | Tidak | `now()`              | Waktu pembaruan record.      |

### Constraint

- Primary key: `id`
- Foreign key: `unit_id` → `unit_kerja.id`

### Index

- `idx_sumber_data_unit` pada kolom `unit_id`.

### Trigger

- `trg_sumber_data_updated_at`: memperbarui waktu perubahan melalui fungsi `set_updated_at()`.

---

## 5. Tabel `indikator`

### Fungsi

Menyimpan definisi indikator SPMI, target ketercapaian, pengaturan tampilan, serta konfigurasi sumber data yang digunakan untuk pengukuran.

### Struktur Kolom

| Kolom                      | Tipe Data     | Null  | Default  | Keterangan                               |
| -------------------------- | ------------- | ----- | -------- | ---------------------------------------- |
| `id`                       | integer       | Tidak | Identity | Primary key.                             |
| `kode_indikator`           | varchar(100)  | Tidak | —        | Kode unik indikator.                     |
| `standard_id`              | integer       | Tidak | —        | Referensi ke standar SPMI.               |
| `unit_id`                  | integer       | Tidak | —        | Referensi ke unit kerja.                 |
| `indikator`                | text          | Tidak | —        | Deskripsi indikator.                     |
| `nama_tampilan`            | text          | Ya    | —        | Nama indikator untuk tampilan aplikasi.  |
| `jenis_indikator`          | varchar(50)   | Tidak | —        | Jenis indikator.                         |
| `target`                   | numeric(15,4) | Ya    | —        | Nilai target indikator.                  |
| `target_keterangan`        | text          | Ya    | —        | Deskripsi target yang mudah dibaca.      |
| `operasi_target`           | varchar(20)   | Ya    | —        | Operator evaluasi target.                |
| `satuan_target`            | varchar(100)  | Ya    | —        | Satuan target.                           |
| `periode`                  | varchar(50)   | Ya    | —        | Periode pengukuran indikator.            |
| `kategori_rujukan`         | varchar(100)  | Ya    | —        | Kategori rujukan indikator.              |
| `rujukan`                  | text          | Ya    | —        | Referensi atau sumber acuan indikator.   |
| `data_source_id`           | integer       | Ya    | —        | Referensi sumber data utama.             |
| `kolom_dari_data_source`   | text          | Ya    | —        | Nama kolom dari sumber data utama.       |
| `data_source_id_2`         | integer       | Ya    | —        | Referensi sumber data tambahan.          |
| `kolom_dari_data_source_2` | text          | Ya    | —        | Nama kolom dari sumber data tambahan.    |
| `urutan`                   | integer       | Tidak | `0`      | Urutan tampilan indikator.               |
| `is_show`                  | boolean       | Tidak | `true`   | Menentukan apakah indikator ditampilkan. |
| `created_at`               | timestamptz   | Tidak | `now()`  | Waktu pembuatan record.                  |
| `updated_at`               | timestamptz   | Tidak | `now()`  | Waktu pembaruan record.                  |

### Constraint

- Primary key: `id`
- Unique: `kode_indikator`
- Foreign key:
  - `standard_id` → `standar.id`
  - `unit_id` → `unit_kerja.id`
  - `data_source_id` → `sumber_data.id`
  - `data_source_id_2` → `sumber_data.id`
- Check constraint: `indikator_jenis_indikator_check`

Nilai `jenis_indikator` yang diperbolehkan:

- `kuantitatif`
- `ketersediaan_dokumen`

### Index

- `idx_indikator_standard` pada `standard_id`.
- `idx_indikator_unit` pada `unit_id`.
- `idx_indikator_sumber_data` pada `data_source_id`.
- `idx_indikator_sumber_data_2` pada `data_source_id_2`.

### Trigger

- `trg_indikator_updated_at`: memperbarui waktu perubahan melalui fungsi `set_updated_at()`.

---

## 6. Tabel `ketersediaan_dokumen`

### Fungsi

Menyimpan daftar dokumen yang harus tersedia pada unit kerja sebagai bagian dari pemenuhan kebutuhan dokumentasi SPMI.

### Struktur Kolom

| Kolom          | Tipe Data | Null  | Default  | Keterangan                                      |
| -------------- | --------- | ----- | -------- | ----------------------------------------------- |
| `id`           | integer   | Tidak | Identity | Primary key.                                    |
| `nama_dokumen` | text      | Tidak | —        | Nama dokumen yang dibutuhkan.                   |
| `unit_id`      | integer   | Tidak | —        | Unit kerja yang bertanggung jawab atas dokumen. |

### Constraint

- Primary key: `id`
- Foreign key: `unit_id` → `unit_kerja.id`

### Index

- `idx_ketersediaan_dokumen_unit` pada `unit_id`.

---

## 7. Tabel `indikator_to_dokumen`

### Fungsi

Menjadi tabel penghubung antara indikator dan dokumen yang diperlukan. Tabel ini memungkinkan satu indikator memiliki beberapa dokumen dan satu dokumen terkait dengan beberapa indikator.

### Struktur Kolom

| Kolom          | Tipe Data | Null  | Default | Keterangan              |
| -------------- | --------- | ----- | ------- | ----------------------- |
| `id_indikator` | integer   | Tidak | —       | Referensi ke indikator. |
| `id_dokumen`   | integer   | Tidak | —       | Referensi ke dokumen.   |

### Constraint

- Primary key gabungan: (`id_indikator`, `id_dokumen`)
- Foreign key:
  - `id_indikator` → `indikator.id`
  - `id_dokumen` → `ketersediaan_dokumen.id`

### Index

- `idx_indikator_to_dokumen_dokumen` pada `id_dokumen`.

---

## 8. Tabel `evaluasi_indikator`

### Fungsi

Menyimpan hasil pengukuran dan evaluasi ketercapaian indikator untuk setiap periode.

### Struktur Kolom

| Kolom                    | Tipe Data     | Null  | Default            | Keterangan                                     |
| ------------------------ | ------------- | ----- | ------------------ | ---------------------------------------------- |
| `id`                     | integer       | Tidak | Identity           | Primary key.                                   |
| `indicator_id`           | integer       | Tidak | —                  | Referensi ke indikator.                        |
| `periode`                | varchar(50)   | Tidak | —                  | Periode evaluasi.                              |
| `actual_value`           | numeric(15,4) | Ya    | —                  | Nilai aktual hasil pengukuran.                 |
| `target_value`           | numeric(15,4) | Ya    | —                  | Nilai target pada saat evaluasi.               |
| `achievement_percentage` | numeric(8,2)  | Ya    | —                  | Persentase ketercapaian.                       |
| `evaluation_status`      | varchar(50)   | Tidak | `belum_dievaluasi` | Status evaluasi.                               |
| `operasi_target`         | varchar(20)   | Ya    | —                  | Operator target yang digunakan dalam evaluasi. |
| `created_at`             | timestamptz   | Tidak | `now()`            | Waktu pembuatan record.                        |
| `updated_at`             | timestamptz   | Tidak | `now()`            | Waktu pembaruan record.                        |

### Constraint

- Primary key: `id`
- Unique gabungan: (`indicator_id`, `periode`)
- Foreign key: `indicator_id` → `indikator.id`

Constraint unik tersebut memastikan satu indikator hanya memiliki satu record evaluasi untuk setiap nilai `periode`.

### Index

- `idx_evaluasi_indicator` pada `indicator_id`.
- `idx_evaluasi_periode` pada `periode`.

### Trigger

- `trg_evaluasi_indikator_updated_at`: memperbarui waktu perubahan melalui fungsi `set_updated_at()`.

---

## 9. Ringkasan Relasi Antartabel

| Tabel Asal             | Kolom Relasi       | Tabel Tujuan              | Relasi                                               |
| ---------------------- | ------------------ | ------------------------- | ---------------------------------------------------- |
| `indikator`            | `standard_id`      | `standar.id`              | Banyak indikator ke satu standar.                    |
| `indikator`            | `unit_id`          | `unit_kerja.id`           | Banyak indikator ke satu unit kerja.                 |
| `indikator`            | `data_source_id`   | `sumber_data.id`          | Banyak indikator dapat menggunakan satu sumber data. |
| `indikator`            | `data_source_id_2` | `sumber_data.id`          | Sumber data tambahan untuk indikator.                |
| `sumber_data`          | `unit_id`          | `unit_kerja.id`           | Banyak sumber data ke satu unit kerja.               |
| `ketersediaan_dokumen` | `unit_id`          | `unit_kerja.id`           | Banyak dokumen ke satu unit kerja.                   |
| `indikator_to_dokumen` | `id_indikator`     | `indikator.id`            | Penghubung indikator dan dokumen.                    |
| `indikator_to_dokumen` | `id_dokumen`       | `ketersediaan_dokumen.id` | Penghubung dokumen dan indikator.                    |
| `evaluasi_indikator`   | `indicator_id`     | `indikator.id`            | Banyak periode evaluasi ke satu indikator.           |

## 10. Catatan Implementasi

1. **Timestamp:** kolom `updated_at` memiliki default `now()`, sedangkan pembaruan otomatis bergantung pada trigger `set_updated_at()`.
2. **Fungsi trigger:** fungsi PostgreSQL `set_updated_at()` harus tersedia agar trigger dapat dijalankan.
3. **Operator target:** nilai `operasi_target` perlu mengikuti konvensi yang digunakan aplikasi, misalnya `=`, `>=`, `<=`, atau `between`, jika nilai tersebut memang didukung oleh logika evaluasi.
4. **Persentase ketercapaian:** perhitungan `achievement_percentage` perlu memperhatikan operator target. Target berbasis rentang atau batas minimum tidak selalu tepat dievaluasi menggunakan rumus aktual dibagi target.
5. **Ketersediaan dokumen:** tabel `ketersediaan_dokumen` menyimpan daftar kebutuhan dokumen. Berdasarkan skema yang diberikan, belum ada tabel khusus untuk menyimpan file yang diunggah atau status pemenuhan dokumen per periode.
6. **Sumber data:** `sumber_data` menyimpan informasi referensi spreadsheet dan worksheet. Skema ini belum menunjukkan detail mekanisme sinkronisasi maupun penyimpanan hasil impor data.
7. **Integritas data:** skema yang diberikan belum mencantumkan aturan `ON DELETE` atau `ON UPDATE` secara eksplisit. Perilaku foreign key mengikuti konfigurasi constraint yang berlaku di PostgreSQL.
8. **Dokumentasi dan database:** file ini merupakan dokumentasi struktur database. Perubahan pada dokumentasi tidak mengubah struktur database di Supabase.

---

_Dokumen ini disusun berdasarkan definisi tabel, constraint, index, dan trigger yang diberikan. Untuk perubahan skema selanjutnya, perbarui dokumentasi ini agar tetap konsisten dengan database aktual._
