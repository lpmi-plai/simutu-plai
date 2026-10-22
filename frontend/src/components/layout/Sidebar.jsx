import { NavLink } from "react-router-dom";
import { MENU } from "../../config/menu";
import Icon from "../ui/Icon";

// NavLink otomatis memberi aria-current="page" pada menu yang aktif.
const kelasDesktop = ({ isActive }) =>
  `flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 ${
    isActive ? "bg-teal-700 text-white" : "hover:bg-slate-800 hover:text-white"
  }`;

const kelasMobile = ({ isActive }) =>
  `shrink-0 rounded-md px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 ${
    isActive ? "bg-teal-700 text-white" : "bg-slate-800"
  }`;

export default function Sidebar() {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 px-4 py-6 text-slate-200 md:flex print:hidden">
        <div className="mb-8 rounded-md border border-slate-600 px-3 py-2 text-lg font-semibold text-white">
          Monitoring
        </div>
        <nav className="flex flex-col gap-1" aria-label="Menu utama">
          {MENU.map((m) => (
            <NavLink key={m.path} to={m.path} className={kelasDesktop}>
              <Icon d={m.icon} />
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile */}
      <header className="bg-slate-900 px-3 py-3 text-slate-200 md:hidden print:hidden">
        <div className="mb-2 px-1 text-base font-semibold text-white">
          Monitoring
        </div>
        <nav className="flex gap-2 overflow-x-auto" aria-label="Menu utama">
          {MENU.map((m) => (
            <NavLink key={m.path} to={m.path} className={kelasMobile}>
              {m.label}
            </NavLink>
          ))}
        </nav>
      </header>
    </>
  );
}
