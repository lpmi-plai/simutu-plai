import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Sidebar from "./components/layout/Sidebar";
import DashboardPage from "./features/dashboard/DashboardPage";
import IndikatorLembagaPage from "./features/indikator-lembaga/IndikatorLembagaPage";
import KetersediaanDokumenPage from "./features/ketersediaan-dokumen/KetersediaanDokumenPage";
import EvaluasiMonevPage from "./features/evaluasi-monev/EvaluasiMonevPage";
import EvaluasiAmiPage from "./features/evaluasi-ami/EvaluasiAmiPage";

import ConnectionTest from "./ConnectionTest";

function App() {
  return (
    <BrowserRouter>
      {/* <ConnectionTest /> */}
      <div className="flex min-h-screen flex-col bg-slate-100 md:flex-row print:bg-white">
        <Sidebar />
        <main className="flex-1 px-4 py-8 md:px-10 print:p-0">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/indikator-lembaga" replace />}
            />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/indikator-lembaga"
              element={<IndikatorLembagaPage />}
            />
            <Route
              path="/ketersediaan-dokumen"
              element={<KetersediaanDokumenPage />}
            />
            <Route path="/evaluasi-monev" element={<EvaluasiMonevPage />} />
            <Route path="/evaluasi-ami" element={<EvaluasiAmiPage />} />
            <Route
              path="*"
              element={<Navigate to="/indikator-lembaga" replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
