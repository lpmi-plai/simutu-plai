from fastapi import APIRouter, HTTPException, Query
from psycopg2.extras import RealDictCursor
import psycopg2

from typing import Optional

from db import get_connection

router = APIRouter(
    prefix="/indikator-lembaga",
    tags=["Indikator Lembaga"]
)


@router.get("")
def get_indikator_lembaga(
    periode: Optional[str] = Query(default=None),
    prodi: Optional[str] = Query(default=None)
):
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:

            query = """
                SELECT
                    i.id,
                    i.standard_id,
                    i.unit_id,
                    i.nama_tampilan,
                    i.kategori_rujukan,
                    i.target,
                    i.satuan_target,
                    i.urutan,
                    i.is_show,

                    uk.nama_unit,
                    uk.kategori_unit,

                    s.aspek_standar,
                    s.nama_standar,

                    -- Sumber data pertama
                    sd1.id AS sumber_data_id,
                    sd1.spreadsheet_name AS spreadsheet_name,
                    sd1.sheet_name AS sheet_name,
                    sd1.spreadsheet_url AS spreadsheet_url,

                    -- Sumber data kedua
                    sd2.id AS sumber_data_id_2,
                    sd2.spreadsheet_name AS spreadsheet_name_2,
                    sd2.sheet_name AS sheet_name_2,
                    sd2.spreadsheet_url AS spreadsheet_url_2,

                    -- Evaluasi indikator
                    ei.id AS evaluasi_id,
                    ei.periode,
                    ei.prodi,
                    ei.actual_value,
                    ei.target_value,
                    ei.operasi_target,
                    ei.achievement_percentage,
                    ei.evaluation_status,
                    ei.created_at AS evaluasi_created_at,
                    ei.updated_at AS evaluasi_updated_at

                FROM public.indikator AS i

                JOIN public.unit_kerja AS uk
                    ON i.unit_id = uk.id

                JOIN public.standar AS s
                    ON i.standard_id = s.id

                LEFT JOIN public.sumber_data AS sd1
                    ON i.data_source_id = sd1.id

                LEFT JOIN public.sumber_data AS sd2
                    ON i.data_source_id_2 = sd2.id

                LEFT JOIN public.evaluasi_indikator AS ei
                    ON ei.indicator_id = i.id
                    AND (%s IS NULL OR ei.periode = %s)
                    AND (%s IS NULL OR ei.prodi = %s)

                WHERE i.jenis_indikator = 'kuantitatif'

                ORDER BY
                    s.aspek_standar ASC,
                    s.nama_standar ASC,
                    uk.nama_unit ASC,
                    i.urutan ASC,
                    ei.periode ASC,
                    ei.prodi ASC;
            """

            cursor.execute(
                query,
                (
                    periode, periode,
                    prodi, prodi
                )
            )

            data = cursor.fetchall()

        return {
            "total": len(data),
            "periode_filter": periode,
            "prodi_filter": prodi,
            "data": data
        }

    except (psycopg2.Error, ValueError):
        raise HTTPException(
            status_code=500,
            detail="Gagal mengambil data indikator lembaga."
        )

    finally:
        if connection is not None:
            connection.close()