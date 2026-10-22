import { useEffect, useState } from "react";
import { linkBackend } from "./config";

export default function ConnectionTest() {
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Menghubungkan ke backend...");

  async function checkConnection() {
    setStatus("checking");
    setMessage("Menghubungkan ke backend...");

    try {
      const response = await fetch(`${linkBackend}/api/health`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setStatus("connected");
      setMessage(data.message);
    } catch (error) {
      setStatus("disconnected");
      setMessage("Gagal terhubung. Pastikan FastAPI sedang berjalan.");
      console.error("Connection error:", error);
    }
  }

  useEffect(() => {
    checkConnection();
  }, []);

  const colors = {
    checking: "#b7791f",
    connected: "#15803d",
    disconnected: "#dc2626",
  };

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: 600,
        margin: "80px auto",
        padding: 24,
        border: "1px solid #ddd",
        borderRadius: 12,
      }}
    >
      <h1>SIMUTU PLAI</h1>
      <p>Sistem Informasi Mutu Internal</p>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 8,
          background: "#f3f4f6",
          color: colors[status],
          fontWeight: "bold",
        }}
      >
        <span>●</span>
        {status === "connected"
          ? "Connected"
          : status === "checking"
            ? "Connecting..."
            : "Disconnected"}
      </div>

      <p>{message}</p>

      <p style={{ color: "#666", fontSize: 14 }}>Backend: {linkBackend}</p>

      <button
        onClick={checkConnection}
        disabled={status === "checking"}
        style={{
          padding: "10px 16px",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Tes Koneksi Ulang
      </button>
    </main>
  );
}
