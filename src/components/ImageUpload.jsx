import { useRef, useState } from "react";
import { Trash2, UploadCloud } from "lucide-react";
import Avatar from "./Avatar";

const MAX_FILE_MB = 5;
const OUTPUT_SIZE = 256;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

// Crops to a centered square, shrinks it and returns a small JPEG data URL
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; // for transparent PNGs
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };

    img.src = url;
  });
}

export default function ImageUpload({ value, onChange, name, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState("");

  const hasImage = /^(https?:\/\/|data:image\/)/i.test(value || "");

  const handleFile = async (file) => {
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      setLocalError("Please choose a JPG, PNG or WEBP image");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setLocalError(`Image must be smaller than ${MAX_FILE_MB} MB`);
      return;
    }

    try {
      setProcessing(true);
      setLocalError("");
      onChange(await resizeImage(file));
    } catch {
      setLocalError("Could not read this image. Try another one.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const message = localError || error;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">Profile picture</label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
        }}
        onDrop={handleDrop}
        className={`flex cursor-pointer items-center gap-5 rounded-2xl border-2 border-dashed p-5 outline-none transition-colors focus-visible:ring-4 focus-visible:ring-primary-500/15 ${
          dragging
            ? "border-primary-500 bg-primary-50"
            : message
            ? "border-danger"
            : "border-border hover:border-primary-300 hover:bg-primary-50/50"
        }`}
      >
        <div className="relative shrink-0">
          <Avatar src={value} name={name} size={80} />
          {processing && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <UploadCloud size={18} className="text-primary-600" />
            {dragging ? "Drop your photo here" : "Drag & drop a photo here"}
          </p>
          <p className="mt-1 text-xs text-muted">
            or <span className="font-bold text-primary-600">click to choose</span> · JPG, PNG or
            WEBP · max {MAX_FILE_MB} MB
          </p>
        </div>

        {hasImage && (
          <button
            type="button"
            title="Remove photo"
            onClick={(e) => {
              e.stopPropagation();
              setLocalError("");
              onChange("");
            }}
            className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-accent-50 hover:text-accent-600"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = ""; // lets the user pick the same file again
        }}
      />

      {message && <p className="mt-1.5 text-xs font-medium text-danger">{message}</p>}
    </div>
  );
}