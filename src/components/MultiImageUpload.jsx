import { useRef, useState } from "react";
import { Star, Trash2, UploadCloud } from "lucide-react";
import { compressImage } from "../utils/uploadImage";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 8;

// items = [{ id, src, blob }]  (blob is null for photos that are already uploaded)
export default function MultiImageUpload({ items, onChange, max = 6, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const room = max - items.length;
    if (room <= 0) {
      setLocalError(`You can add up to ${max} photos`);
      return;
    }

    let problem = files.length > room ? `Only ${max} photos allowed, extra files were skipped` : "";
    const valid = [];
    for (const f of files.slice(0, room)) {
      if (!ALLOWED.includes(f.type)) problem = "Only JPG, PNG or WEBP images are allowed";
      else if (f.size > MAX_MB * 1024 * 1024) problem = `Each photo must be under ${MAX_MB} MB`;
      else valid.push(f);
    }
    setLocalError(problem);
    if (!valid.length) return;

    try {
      setBusy(true);
      const added = [];
      for (const f of valid) {
        const blob = await compressImage(f);
        added.push({ id: crypto.randomUUID(), src: URL.createObjectURL(blob), blob });
      }
      onChange([...items, ...added]);
    } catch {
      setLocalError("One of the images could not be read");
    } finally {
      setBusy(false);
    }
  };

  const remove = (id) => {
    const target = items.find((i) => i.id === id);
    if (target?.blob) URL.revokeObjectURL(target.src);
    onChange(items.filter((i) => i.id !== id));
  };

  const makeCover = (id) => {
    const target = items.find((i) => i.id === id);
    onChange([target, ...items.filter((i) => i.id !== id)]);
  };

  const message = localError || error;

  return (
    <div>
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
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-8 text-center outline-none transition-colors focus-visible:ring-4 focus-visible:ring-primary-500/15 ${
          dragging
            ? "border-primary-500 bg-primary-50"
            : message
            ? "border-danger"
            : "border-border hover:border-primary-300 hover:bg-primary-50/50"
        }`}
      >
        <UploadCloud size={30} className="text-primary-600" />
        <p className="text-sm font-bold text-ink">
          {busy ? "Processing photos..." : dragging ? "Drop photos here" : "Drag & drop photos here"}
        </p>
        <p className="text-xs text-muted">
          or <span className="font-bold text-primary-600">click to choose</span> · JPG, PNG or WEBP ·
          up to {max} photos
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {message && <p className="mt-1.5 text-xs font-medium text-danger">{message}</p>}

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((img, index) => (
            <div
              key={img.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-slate-100"
            >
              <img src={img.src} alt="" className="h-full w-full object-cover" />

              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  Cover
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                {index !== 0 && (
                  <button
                    type="button"
                    title="Make cover photo"
                    onClick={() => makeCover(img.id)}
                    className="rounded-lg bg-white/90 p-1.5 text-primary-700 hover:bg-white"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  type="button"
                  title="Remove photo"
                  onClick={() => remove(img.id)}
                  className="rounded-lg bg-white/90 p-1.5 text-accent-600 hover:bg-white"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}