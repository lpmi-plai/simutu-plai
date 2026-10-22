
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

try:
    connection = psycopg2.connect(DATABASE_URL)
    print("Koneksi ke database berhasil!")

    cursor = connection.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()

    print("Versi PostgreSQL:")
    print(version[0])

    cursor.close()
    connection.close()
    print("Koneksi ditutup.")

except Exception as e:
    print("Koneksi gagal:", e)
