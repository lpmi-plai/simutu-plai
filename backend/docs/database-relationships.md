# Database Relationships — Sistem Monitoring SPMI

## 1. Gambaran Relasi Database

Diagram berikut menunjukkan hubungan antara tujuh tabel utama pada database monitoring SPMI.

```mermaid
erDiagram
    UNIT_KERJA ||--o{ INDIKATOR : memiliki
    STANDAR ||--o{ INDIKATOR : menaungi

    UNIT_KERJA ||--o{ SUMBER_DATA : memiliki
    SUMBER_DATA o|--o{ INDIKATOR : "sumber utama"
    SUMBER_DATA o|--o{ INDIKATOR : "sumber tambahan"

    UNIT_KERJA ||--o{ KETERSEDIAAN_DOKUMEN : membutuhkan

    INDIKATOR ||--o{ INDIKATOR_TO_DOKUMEN : terkait
    KETERSEDIAAN_DOKUMEN ||--o{ INDIKATOR_TO_DOKUMEN : terkait

    INDIKATOR ||--o{ EVALUASI_INDIKATOR : dievaluasi

    UNIT_KERJA {
        int id PK
        varchar nama_unit
        varchar jenis_unit
        varchar kategori_unit
        boolean is_active
    }

    STANDAR {
        int id PK
        varchar kode_standar UK
        varchar aspek_standar
        varchar nama_standar
        varchar versi
        boolean is_active
    }

    SUMBER_DATA {
        int id PK
        int unit_id FK
        varchar spreadsheet_name
        text spreadsheet_url
        varchar sheet_name
        timestamptz last_synced_at
        varchar sync_status
        boolean is_active
    }

    INDIKATOR {
        int id PK
        varchar kode_indikator UK
        int standard_id FK
        int unit_id FK
        text indikator
        numeric target
        varchar jenis_indikator
        int data_source_id FK
        text kolom_dari_data_source
        int data_source_id_2 FK
        text kolom_dari_data_source_2
        varchar periode
        varchar operasi_target
        boolean is_show
    }

    KETERSEDIAAN_DOKUMEN {
        int id PK
        text nama_dokumen
        int unit_id FK
    }

    INDIKATOR_TO_DOKUMEN {
        int id_indikator PK, FK
        int id_dokumen PK, FK
    }

    EVALUASI_INDIKATOR {
        int id PK
        int indicator_id FK
        varchar periode
        numeric actual_value
        numeric target_value
        numeric achievement_percentage
        varchar evaluation_status
        varchar operasi_target
    }
```

## 2. Penjelasan Relasi

| Relasi                                | Kardinalitas | Penjelasan                                                                                         |
| ------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `unit_kerja` → `indikator`            | One-to-many  | Satu unit kerja dapat memiliki banyak indikator.                                                   |
| `standar` → `indikator`               | One-to-many  | Satu standar dapat menaungi banyak indikator.                                                      |
| `unit_kerja` → `sumber_data`          | One-to-many  | Satu unit kerja dapat memiliki banyak sumber data.                                                 |
| `sumber_data` → `indikator`           | One-to-many  | Satu sumber data dapat digunakan oleh banyak indikator, baik sebagai sumber utama maupun tambahan. |
| `unit_kerja` → `ketersediaan_dokumen` | One-to-many  | Satu unit kerja dapat memiliki banyak kebutuhan dokumen.                                           |
| `indikator` ↔ `ketersediaan_dokumen`  | Many-to-many | Hubungan indikator dan dokumen dikelola melalui tabel `indikator_to_dokumen`.                      |
| `indikator` → `evaluasi_indikator`    | One-to-many  | Satu indikator dapat memiliki evaluasi pada beberapa periode.                                      |

## 3. Keterangan Simbol

- `PK`: Primary key.
- `FK`: Foreign key.
- `UK`: Unique key.
- `||`: Tepat satu.
- `o|`: Nol atau satu.
- `o{`: Nol atau banyak.
- `|{`: Satu atau banyak.

## 4. Catatan

1. Relasi antara `indikator` dan `sumber_data` menggunakan dua foreign key: `data_source_id` dan `data_source_id_2`.
2. Relasi indikator dan dokumen bersifat many-to-many melalui `indikator_to_dokumen`.
3. Setiap kombinasi `indicator_id` dan `periode` hanya dapat muncul satu kali dalam `evaluasi_indikator`.
4. Diagram menggambarkan constraint relasional yang diberikan pada skema database. Aturan bisnis tambahan tidak otomatis tercermin dalam diagram ini.
