import { fileUrl } from "../api/client";

export default function Avatar({ src, name, size = 40 }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const style = { width: size, height: size, fontSize: size * 0.42 };

  if (src) {
    return (
      <img
        className="avatar"
        style={style}
        src={fileUrl(src)}
        alt={name || "avatar"}
      />
    );
  }

  return (
    <div className="avatar avatar-fallback" style={style}>
      {initial}
    </div>
  );
}
