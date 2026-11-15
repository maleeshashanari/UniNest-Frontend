import { useState } from "react";

export default function Avatar({ src, name = "", size = 40 }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const valid = src && /^(https?:\/\/|data:image\/)/i.test(src) && failedSrc !== src;

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "U";

  if (valid) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        style={{ width: size, height: size }}
        className="rounded-full border-2 border-primary-100 object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-500 font-extrabold text-white"
    >
      {initials}
    </div>
  );
}