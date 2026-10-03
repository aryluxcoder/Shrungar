export function formatDate(ts: number) {
  if (Date.now() - ts < 60_000) return 'Just now';
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function initial(name: string) {
  return (name.trim()[0] ?? '?').toUpperCase();
}
