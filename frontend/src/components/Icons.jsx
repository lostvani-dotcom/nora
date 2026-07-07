const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function HomeIcon({ size = 24, filled = false }) {
  return (
    <svg {...base} width={size} height={size} fill={filled ? "currentColor" : "none"}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" fill={filled ? "currentColor" : "none"} />
    </svg>
  );
}

export function SearchIcon({ size = 24, filled = false }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={filled ? 3 : 2}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function PlusSquareIcon({ size = 24, filled = false }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={filled ? 2.6 : 2}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

export function HeartIcon({ size = 24, filled = false }) {
  return (
    <svg
      {...base}
      width={size}
      height={size}
      fill={filled ? "#ed4956" : "none"}
      stroke={filled ? "#ed4956" : "currentColor"}
    >
      <path d="M12 21s-7.5-4.7-10-9.3C.6 8.3 2.6 4.5 6.3 4.5c2.2 0 3.9 1.2 5.7 3.4 1.8-2.2 3.5-3.4 5.7-3.4 3.7 0 5.7 3.8 4.3 7.2C19.5 16.3 12 21 12 21Z" />
    </svg>
  );
}

export function CommentIcon({ size = 24 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1.1L3 21l1.6-5.3A8.5 8.5 0 1 1 21 12Z" />
    </svg>
  );
}

export function LogoutIcon({ size = 24 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

export function TrashIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

export function CameraIcon({ size = 48 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.4}>
      <path d="M4 8h2.6l1.6-2.4A1.5 1.5 0 0 1 9.5 5h5a1.5 1.5 0 0 1 1.3.6L17.4 8H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="14" r="4" />
    </svg>
  );
}

export function SettingsIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}
