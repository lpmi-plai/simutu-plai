from fastapi import APIRouter, HTTPException, Query
from psycopg2.extras import RealDictCursor
from typing import Optional
import psycopg2

from db import get_connection

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/ketercapaian")
def get_ketercapaian(
    periode: Optional[str] = Query(default=None),
    prodi: Optional[str] = Query(default=None),
):
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:

            query = """
                SELECT
                    i.id AS indikator_id,
                    i.kode_indikator,
                    COALESCE(i.nama_tampilan, i.indikator)
                        AS nama_indikator,
                    i.kategori_rujukan,
                    i.target,
                    i.operasi_target,
                    i.satuan_target,
                    i.urutan,

                    uk.id AS unit_id,
                    uk.nama_unit,
                    uk.kategori_unit,

                    s.id AS standard_id,
                    s.aspek_standar,
                    s.nama_standar,

                    ei.id AS evaluasi_id,
                    ei.periode,
                    ei.prodi,
                    ei.actual_value,
                    ei.target_value,
                    ei.achievement_percentage,
                    ei.evaluation_status

                FROM public.indikator AS i

                JOIN public.unit_kerja AS uk
                    ON uk.id = i.unit_id

                JOIN public.standar AS s
                    ON s.id = i.standard_id

                LEFT JOIN LATERAL (
                    SELECT
                        e.id,
                        e.periode,
                        e.prodi,
                        e.actual_value,
                        e.target_value,
                        e.achievement_percentage,
                        e.evaluation_status,
                        e.updated_at

                    FROM public.evaluasi_indikator AS e

                    WHERE e.indicator_id = i.id

                      AND (
                          %s IS NULL
                          OR e.periode = %s
                      )

                      AND (
                          (
                              %s IS NOT NULL
                              AND e.prodi = %s
                          )
                          OR (
                              %s IS NULL
                              AND (
                                  e.prodi IS NULL
                                  OR BTRIM(e.prodi) = ''
                              )
                          )
                      )

                    ORDER BY e.updated_at DESC, e.id DESC
                    LIMIT 1
                ) AS ei ON TRUE

                WHERE i.jenis_indikator = 'kuantitatif'
                  AND i.is_show = TRUE
                  AND uk.is_active = TRUE

                ORDER BY
                    s.aspek_standar ASC NULLS LAST,
                    s.nama_standar ASC NULLS LAST,
                    uk.nama_unit ASC,
                    i.urutan ASC,
                    i.id ASC;
            """

            cursor.execute(
                query,
                (
                    periode, periode,
                    prodi, prodi, prodi
                )
            )

            data = cursor.fetchall()

        return {
            "total": len(data),
            "periode_filter": periode,
            "prodi_filter": prodi,
            "data": data,
        }

    except psycopg2.Error:
        raise HTTPException(
            status_code=500,
            detail="Gagal mengambil data dashboard ketercapaian."
        )

    finally:
        if connection is not None:
            connection.close()