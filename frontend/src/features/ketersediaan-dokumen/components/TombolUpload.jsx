import { useRef } from "react";
import Icon from "../../../components/ui/Icon";

export default function TombolUpload({ nama, onPilih }) {
  const inputRef = useRef(null);

  function saatDipilih(e) {
    const file = e.target.files?.[0];
    if (file) onPilih(file);
    e.target.value = ""; // supaya file yang sama bisa dipilih lagi
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={saatDipilih}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={`Unggah dokumen ${nama}`}
        title="Unggah file"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition-colors hover:border-teal-600 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <Icon d="M12 16V4M7 9l5-5 5 5M4 20h16" />
      </button>
    </>
  );
}
