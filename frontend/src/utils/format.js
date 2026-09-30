const dateFmt = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
const numberFmt = new Intl.NumberFormat('en-IN');

export function formatDate(value) {
  if (!value) return '—';
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  return dateFmt.format(new Date(y, m - 1, d));
}

export function formatDateTime(value) {
  return value ? dateTimeFmt.format(new Date(value)) : '—';
}

export function formatNumber(value) {
  return numberFmt.format(Number(value) || 0);
}

export function toInputDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function firstOfMonth(date = new Date()) {
  return toInputDate(new Date(date.getFullYear(), date.getMonth(), 1));
}
