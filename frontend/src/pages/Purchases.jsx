import { useState } from 'react';
import { Plus } from 'lucide-react';
import { purchaseApi } from '../api/services';
import { useApi } from '../hooks/useApi';
import { useLookups } from '../hooks/useLookups';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import PurchaseForm from '../components/forms/PurchaseForm';
import { Alert, Badge, Modal, PageHeader } from '../components/ui';
import { formatDate, formatNumber } from '../utils/format';

const EMPTY_FILTERS = { start_date: '', end_date: '', base_id: '', category: '', equipment_type_id: '' };

const COLUMNS = [
  { key: 'purchase_date', label: 'Date', render: (r) => formatDate(r.purchase_date) },
  { key: 'base_name', label: 'Base' },
  { key: 'equipment_name', label: 'Equipment', render: (r) => <span className="font-medium">{r.equipment_name}</span> },
  { key: 'category', label: 'Category', render: (r) => <Badge>{r.category}</Badge> },
  { key: 'quantity', label: 'Quantity', align: 'right', render: (r) => `${formatNumber(r.quantity)} ${r.unit}` },
  { key: 'remarks', label: 'Remarks' },
  { key: 'created_by_name', label: 'Recorded by' },
];

export default function Purchases() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const { bases, equipmentTypes } = useLookups();
  const { data, loading, error, reload } = useApi(() => purchaseApi.list(filters), JSON.stringify(filters));

  const onSaved = (p) => {
    setFormOpen(false);
    setSuccess(`Purchase #${p.id} recorded: ${formatNumber(p.quantity)} units.`);
    reload();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Purchases"
        subtitle="New assets received by a base"
        action={
          <button onClick={() => setFormOpen(true)} className="btn-primary">
            <Plus size={18} /> New purchase
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
      />

      <DataTable columns={COLUMNS} rows={data} loading={loading} error={error} emptyText="No purchases match these filters" />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Record purchase">
        <PurchaseForm bases={bases} equipmentTypes={equipmentTypes} onSaved={onSaved} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
