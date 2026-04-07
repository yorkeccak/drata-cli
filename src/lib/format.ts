import pc from 'picocolors';

export function relTime(iso: string | null | undefined): string {
  if (!iso) return '-';
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function colorStatus(status: string): string {
  const s = status.toLowerCase();
  if (s === 'passing' || s === 'pass' || s === 'compliant' || s === 'active' || s === 'ready' || s === 'approved')
    return pc.green(status);
  if (s === 'failing' || s === 'fail' || s === 'non-compliant' || s === 'failed' || s === 'critical')
    return pc.red(status);
  if (s === 'warning' || s === 'pending' || s === 'in_progress' || s === 'partial')
    return pc.yellow(status);
  if (s === 'archived' || s === 'removed' || s === 'deleted' || s === 'disabled')
    return pc.dim(status);
  return status;
}

export function truncate(str: string, max: number): string {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function padTable(rows: string[][]): string {
  if (rows.length === 0) return '';
  const colWidths = rows[0].map((_, colIdx) =>
    Math.max(...rows.map(row => (row[colIdx] ?? '').length))
  );
  return rows
    .map(row => row.map((cell, i) => (cell ?? '').padEnd(colWidths[i])).join('  '))
    .join('\n');
}
