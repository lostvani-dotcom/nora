export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  const units = [
    { label: "a", secs: 31536000 },
    { label: "m", secs: 2592000 },
    { label: "sem", secs: 604800 },
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "min", secs: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(seconds / unit.secs);
    if (value >= 1) return `${value}${unit.label}`;
  }
  return "agora";
}
