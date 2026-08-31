import dayjs from 'dayjs';

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return dayjs(iso).format('DD MMM YYYY');
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  return dayjs(iso).format('DD MMM YYYY, HH:mm');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str
    .replace(/-/g, ' ')
    .split(' ')
    .map(capitalize)
    .join(' ');
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`;
}
