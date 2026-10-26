import { formatDistanceToNowStrict, format } from 'date-fns';

export function formatDuration(seconds: number, { compact = false } = {}) {
  if (!Number.isFinite(seconds) || seconds <= 0) return compact ? '0:00' : '0m 0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (compact) return `${m}:${s.toString().padStart(2, '0')}`;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function formatMinutes(minutes: number) {
  if (!Number.isFinite(minutes)) return '0m';
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${m}m`;
  }
  return `${Math.round(minutes * 10) / 10}m`;
}

export function timeAgo(iso: string) {
  try {
    return `${formatDistanceToNowStrict(new Date(iso))} ago`;
  } catch {
    return 'recently';
  }
}

export function shortDate(iso: string) {
  try {
    return format(new Date(iso), 'MMM d, HH:mm');
  } catch {
    return iso;
  }
}

export function dayLabel(isoDate: string) {
  try {
    return format(new Date(`${isoDate}T12:00:00`), 'EEE');
  } catch {
    return isoDate;
  }
}

export const pct = (v: number) => `${Math.round(v * 100)}%`;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`;
}

export const uid = (prefix = 'tmp') => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export function readRecentProjects(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem('pulsar.recentProjects') || '[]');
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function pushRecentProject(id: string) {
  const next = [id, ...readRecentProjects().filter((r) => r !== id)].slice(0, 5);
  try {
    localStorage.setItem('pulsar.recentProjects', JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}
