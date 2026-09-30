import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { auditApi } from '../api/services';
import { useApi } from '../hooks/useApi';
import DataTable from '../components/DataTable';
import { Badge, Modal, PageHeader } from '../components/ui';
import { formatDateTime } from '../utils/format';
import { ROLE_LABELS } from '../utils/constants';

const PAGE_SIZE = 25;
const ACTIONS = ['LOGIN', 'LOGIN_FAILED', 'CREATE_PURCHASE', 'CREATE_TRANSFER', 'CREATE_ASSIGNMENT', 'CREATE_EXPENDITURE'];
const EMPTY_FILTERS = { action: '', start_date: '', end_date: '' };

const actionTone = (a) => (a === 'LOGIN_FAILED' ? 'red' : a === 'LOGIN' ? 'stone' : 'army');

const COLUMNS = [
  { key: 'created_at', label: 'Time', render: (r) => formatDateTime(r.created_at) },
  {
    key: 'user_name',
    label: 'User',
    render: (r) => (
      <span>
        {r.user_name ?? 'Unknown'}
        {r.user_role && <span className="ml-1 text-xs text-stone-500">{ROLE_LABELS[r.user_role]}</span>}
      </span>
    ),
  },
  { key: 'action', label: 'Action', render: (r) => <Badge tone={actionTone(r.action)}>{r.action}</Badge> },
  { key: 'entity', label: 'Record', render: (r) => (r.entity ? `${r.entity} #${r.entity_id ?? '—'}` : '—') },
  { key: 'ip_address', label: 'IP', render: (r) => <span className="font-mono text-xs">{r.ip_address}</span> },
];

export default function AuditLogs() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);

  const params = { ...filters, limit: PAGE_SIZE, offset: page * PAGE_SIZE };
  const { data, loading, error } = useApi(() => auditApi.list(params), JSON.stringify(params));

  const setFilter = (key) => (e) => {
    setFilters({ ...filters, [key]: e.target.value });
    setPage(0);
  };

  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="animate-fade-in">
      <PageHeader title="Audit logs" subtitle="Every login and transaction, newest first. Click a row for full details." />

      <div className="card mb-5 grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        <label className="block">
          <span className="label">Action</span>
          <select className="input" value={filters.action} onChange={setFilter('action')}>
            <option value="">All actions</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">From</span>
          <input type="date" className="input" value={filters.start_date} onChange={setFilter('start_date')} />
        </label>
        <label className="block">
          <span className="label">To</span>
          <input type="date" className="input" value={filters.end_date} onChange={setFilter('end_date')} />
        </label>
        <div className="flex items-end">
          <button className="btn-secondary w-full" onClick={() => { setFilters(EMPTY_FILTERS); setPage(0); }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      <DataTable columns={COLUMNS} rows={data?.logs} loading={loading} error={error} onRowClick={setSelected} emptyText="No log entries" />

      <div className="mt-4 flex items-center justify-between text-sm text-stone-600">
        <span>{total} entries</span>
        <div className="flex items-center gap-2">
          <button className="btn-secondary px-2" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page">
            <ChevronLeft size={18} />
          </button>
          <span>Page {page + 1} of {pages}</span>
          <button className="btn-secondary px-2" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)} aria-label="Next page">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${selected.action} · log #${selected.id}` : ''}>
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <Detail label="User" value={selected.user_name ?? 'Unknown'} />
              <Detail label="Role" value={ROLE_LABELS[selected.user_role] ?? '—'} />
              <Detail label="Time" value={formatDateTime(selected.created_at)} />
              <Detail label="IP" value={selected.ip_address} />
            </div>
            <div>
              <span className="label">Payload</span>
              <pre className="overflow-x-auto rounded-lg bg-stone-900 p-3 text-xs text-army-100">
                {JSON.stringify(selected.payload, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
