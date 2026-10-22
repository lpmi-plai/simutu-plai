# routers/ketersediaan.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from psycopg2.extras import RealDictCursor
import psycopg2

from db import get_connection

router = APIRouter(
    prefix="/ketersediaan",
    tags=["Ketersediaan Dokumen"]
)

class LinkDokumenRequest(BaseModel):
    link_dokumen: HttpUrl

@router.get("/dokumen")
def get_ketersediaan_dokumen():
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:
            query = """
                SELECT
                    kd.id,
                    kd.nama_dokumen,
                    kd.link_dokumen,
                    kd.kategori_dokumen,
                    uk.nama_unit,
                    uk.kategori_unit
                FROM public.ketersediaan_dokumen AS kd
                JOIN public.unit_kerja AS uk
                    ON kd.unit_id = uk.id
                ORDER BY
                    uk.nama_unit ASC,
                    kd.nama_dokumen ASC;
            """

            cursor.execute(query)
            data = cursor.fetchall()

        return {
            "total": len(data),
            "data": data
        }

    except (psycopg2.Error, ValueError):
        raise HTTPException(
            status_code=500,
            detail="Gagal mengambil data ketersediaan dokumen."
        )

    finally:
        if connection is not None:
            connection.close()

@router.put("/dokumen/{dokumen_id}/link")
def simpan_link_dokumen(
    dokumen_id: int,
    payload: LinkDokumenRequest
):
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:
            query = """
                UPDATE public.ketersediaan_dokumen
                SET link_dokumen = %s
                WHERE id = %s
                RETURNING id, nama_dokumen, link_dokumen;
            """

            cursor.execute(
                query,
                (str(payload.link_dokumen), dokumen_id)
            )

            data = cursor.fetchone()

            if data is None:
                connection.rollback()
                raise HTTPException(
                    status_code=404,
                    detail="Dokumen tidak ditemukan."
                )

        connection.commit()

        return {
            "message": "Link dokumen berhasil disimpan.",
            "data": data
        }

    except HTTPException:
        raise

    except psycopg2.Error:
        if connection is not None:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail="Gagal menyimpan link dokumen."
        )

    finally:
        if connection is not None:
            connection.close()