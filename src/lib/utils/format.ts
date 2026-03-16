export function formatDistanceNm(nm: number): string {
  return `${nm.toFixed(1)} nm`;
}

export function formatSpeedKts(kts: number | null): string {
  if (kts === null) return "\u2014";
  return `${kts.toFixed(1)} kts`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "\u2014";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}
