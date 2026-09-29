const dateFmt = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
const numberFmt = new Intl.NumberFormat('en-IN');

// '2026-09-01' → '01 Sep 2026'. Parsed as local date so the day never shifts.
export function formatDate(value) {
  if (!value) return '—';
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  return dateFmt.format(new Date(y, m - 1, d));
}

// ISO timestamp → '29 Sep 2026, 02:15 pm'
export function formatDateTime(value) {
  return value ? dateTimeFmt.format(new Date(value)) : '—';
}

// 12500 → '12,500'
export function formatNumber(value) {
  return numberFmt.format(Number(value) || 0);
}

// Local 'YYYY-MM-DD' (toISOString would use UTC and can be a day off)
export function toInputDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function firstOfMonth(date = new Date()) {
  return toInputDate(new Date(date.getFullYear(), date.getMonth(), 1));
}
