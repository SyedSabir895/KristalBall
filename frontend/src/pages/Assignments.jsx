import { useState } from 'react';
import { Plus } from 'lucide-react';
import { assignmentApi, expenditureApi } from '../api/services';
import { useApi } from '../hooks/useApi';
import { useLookups } from '../hooks/useLookups';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import AssignmentForm from '../components/forms/AssignmentForm';
import ExpenditureForm from '../components/forms/ExpenditureForm';
import { Alert, Badge, Modal, PageHeader, Tabs } from '../components/ui';
import { formatDate, formatNumber } from '../utils/format';

const EMPTY_FILTERS = { start_date: '', end_date: '', base_id: '', category: '', equipment_type_id: '', personnel: '' };

const qty = (r) => `${formatNumber(r.quantity)} ${r.unit}`;

// Everything that differs between the two tabs lives here
const SECTIONS = {
  assignments: {
    label: 'Assignments',
    button: 'Assign asset',
    api: assignmentApi,
    Form: AssignmentForm,
    saved: (r) => `Assigned ${formatNumber(r.quantity)} units to ${r.personnel_name}.`,
    columns: [
      { key: 'assignment_date', label: 'Date', render: (r) => formatDate(r.assignment_date) },
      {
        key: 'personnel_name',
        label: 'Personnel',
        render: (r) => (
          <span>
            <span className="font-medium">{r.personnel_name}</span>
            {r.personnel_id && <span className="ml-1 text-xs text-stone-500">({r.personnel_id})</span>}
          </span>
        ),
      },
      { key: 'base_name', label: 'Base' },
      { key: 'equipment_name', label: 'Equipment' },
      { key: 'category', label: 'Category', render: (r) => <Badge>{r.category}</Badge> },
      { key: 'quantity', label: 'Quantity', align: 'right', render: qty },
      { key: 'created_by_name', label: 'By' },
    ],
  },
  expenditures: {
    label: 'Expenditures',
    button: 'Record expenditure',
    api: expenditureApi,
    Form: ExpenditureForm,
    saved: (r) => `Expenditure #${r.id} recorded: ${formatNumber(r.quantity)} units.`,
    columns: [
      { key: 'expenditure_date', label: 'Date', render: (r) => formatDate(r.expenditure_date) },
      { key: 'base_name', label: 'Base' },
      { key: 'equipment_name', label: 'Equipment', render: (r) => <span className="font-medium">{r.equipment_name}</span> },
      { key: 'category', label: 'Category', render: (r) => <Badge>{r.category}</Badge> },
      { key: 'quantity', label: 'Quantity', align: 'right', render: qty },
      { key: 'reason', label: 'Reason' },
      { key: 'created_by_name', label: 'By' },
    ],
  },
};

export default function Assignments() {
  const [tab, setTab] = useState('assignments');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const { bases, equipmentTypes } = useLookups();

  const section = SECTIONS[tab];
  // personnel filter only exists for assignments
  const params = tab === 'assignments' ? filters : { ...filters, personnel: '' };
  const { data, loading, error, reload } = useApi(() => section.api.list(params), `${tab}-${JSON.stringify(params)}`);

  const onSaved = (record) => {
    setFormOpen(false);
    setSuccess(section.saved(record));
    reload();
  };

  const { Form } = section;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Assignments & Expenditures"
        subtitle="Assets issued to personnel and assets used up"
        action={
          <button onClick={() => setFormOpen(true)} className="btn-primary">
            <Plus size={18} /> {section.button}
          </button>
        }
      />

      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={(v) => { setTab(v); setSuccess(''); }}
          tabs={Object.entries(SECTIONS).map(([value, s]) => ({ value, label: s.label }))}
        />
      </div>

      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      <FilterBar
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
        bases={bases}
        equipmentTypes={equipmentTypes}
      >
        {tab === 'assignments' && (
          <label className="block">
            <span className="label">Personnel</span>
            <input
              className="input"
              placeholder="Name or service no."
              value={filters.personnel}
              onChange={(e) => setFilters({ ...filters, personnel: e.target.value })}
            />
          </label>
        )}
      </FilterBar>

      <DataTable columns={section.columns} rows={data} loading={loading} error={error} emptyText={`No ${section.label.toLowerCase()} found`} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={section.button}>
        <Form bases={bases} equipmentTypes={equipmentTypes} onSaved={onSaved} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
