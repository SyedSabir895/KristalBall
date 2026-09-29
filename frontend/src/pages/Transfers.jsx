import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { transferApi } from '../api/services';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { useLookups } from '../hooks/useLookups';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import TransferForm from '../components/forms/TransferForm';
import { Alert, Badge, Modal, PageHeader } from '../components/ui';
import { formatDate, formatDateTime, formatNumber } from '../utils/format';

const EMPTY_FILTERS = { start_date: '', end_date: '', base_id: '', direction: '', category: '', equipment_type_id: '' };

export default function Transfers() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const { bases, equipmentTypes } = useLookups();
  const { data, loading, error, reload } = useApi(() => transferApi.list(filters), JSON.stringify(filters));

  // Direction only makes sense relative to one base
  const myBaseId = user.role === 'BASE_COMMANDER' ? user.base_id : filters.base_id;

  const columns = [
    { key: 'transfer_date', label: 'Date', render: (r) => formatDate(r.transfer_date) },
    {
      key: 'route',
      label: 'Route',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          {r.from_base_name} <ArrowRight size={14} className="text-stone-400" /> {r.to_base_name}
        </span>
      ),
    },
    {
      key: 'direction',
      label: 'Type',
      render: (r) => {
        if (!myBaseId) return <Badge>Transfer</Badge>;
        return String(r.to_base_id) === String(myBaseId) ? <Badge tone="army">Incoming</Badge> : <Badge tone="amber">Outgoing</Badge>;
      },
    },
    { key: 'equipment_name', label: 'Equipment', render: (r) => <span className="font-medium">{r.equipment_name}</span> },
    { key: 'quantity', label: 'Quantity', align: 'right', render: (r) => `${formatNumber(r.quantity)} ${r.unit}` },
    { key: 'created_by_name', label: 'By' },
    { key: 'created_at', label: 'Logged at', render: (r) => <span className="text-xs text-stone-500">{formatDateTime(r.created_at)}</span> },
  ];

  const onSaved = (t) => {
    setFormOpen(false);
    setSuccess(`Transfer #${t.id} completed: ${formatNumber(t.quantity)} units moved.`);
    reload();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transfers"
        subtitle="Asset movements between bases"
        action={
          <button onClick={() => setFormOpen(true)} className="btn-primary">
            <Plus size={18} /> New transfer
          </button>
        }
      />

      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <FilterBar
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
        bases={bases}
        equipmentTypes={equipmentTypes}
      >
        <label className="block">
          <span className="label">Direction</span>
          <select
            className="input"
            disabled={!myBaseId}
            value={filters.direction}
            onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
          >
            <option value="">In &amp; out</option>
            <option value="in">Incoming</option>
            <option value="out">Outgoing</option>
          </select>
        </label>
      </FilterBar>

      <DataTable columns={columns} rows={data} loading={loading} error={error} emptyText="No transfers match these filters" />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="New transfer">
        <TransferForm bases={bases} equipmentTypes={equipmentTypes} onSaved={onSaved} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
