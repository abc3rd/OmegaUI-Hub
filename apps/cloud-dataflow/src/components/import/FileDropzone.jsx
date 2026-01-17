import React from "react";
import { Upload } from "lucide-react";

export default function FileDropzone({ onFiles, accept = ".csv,.json" }) {
  const inputRef = React.useRef(null);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFiles = (files) => {
    if (!files?.length) return;
    onFiles?.(Array.from(files));
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:bg-slate-50"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <Upload className="w-6 h-6 text-slate-600" />
        </div>
        <div className="font-medium text-slate-900">Drop a CSV/JSON file here or click to upload</div>
        <div className="text-sm text-slate-500">Accepted: .csv, .json</div>
      </div>
    </div>
  );
}