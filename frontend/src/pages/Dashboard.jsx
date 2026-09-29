import { useState } from 'react';
import { Archive, ArrowLeftRight, Flame, PackageCheck, UserCheck } from 'lucide-react';
import { dashboardApi } from '../api/services';
import { useApi } from '../hooks/useApi';
import { useLookups } from '../hooks/useLookups';
import FilterBar from '../components/FilterBar';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { Alert, Badge, Modal, PageHeader, Tabs } from '../components/ui';
import { firstOfMonth, formatDate, formatNumber, toInputDate } from '../utils/format';

const defaultFilters = () => ({
  start_date: firstOfMonth(),
  end_date: toInputDate(),
  base_id: '',
  category: '',
  equipment_type_id: '',
});

const num = (key) => (row) => formatNumber(row[key]);

// Per-equipment breakdown under the cards
const BREAKDOWN_COLUMNS = [
  { key: 'equipment_name', label: 'Equipment', render: (r) => <span className="font-medium">{r.equipment_name}</span> },
  { key: 'category', label: 'Category', render: (r) => <Badge>{r.category}</Badge> },
  { key: 'opening_balance', label: 'Opening', align: 'right', render: num('opening_balance') },
  { key: 'purchases', label: 'Purchased', align: 'right', render: num('purchases') },
  { key: 'transfer_in', label: 'In', align: 'right', render: num('transfer_in') },
  { key: 'transfer_out', label: 'Out', align: 'right', render: num('transfer_out') },
  { key: 'assigned', label: 'Assigned', align: 'right', render: num('assigned') },
  { key: 'expended', label: 'Expended', align: 'right', render: num('expended') },
  {
    key: 'closing_balance',
    label: 'Closing',
    align: 'right',
    render: (r) => <span className="font-semibold">{formatNumber(r.closing_balance)} <span className="text-xs font-normal text-stone-500">{r.unit}</span></span>,
  },
];

export default function Dashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const [showNet, setShowNet] = useState(false);
  const { bases, equipmentTypes } = useLookups();
  const { data, loading, error } = useApi(() => dashboardApi.summary(filters), JSON.stringify(filters));

  const t = data?.totals ?? {};

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle={`Asset position from ${formatDate(filters.start_date)} to ${formatDate(filters.end_date)}`}
      />

      <FilterBar
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters())}
        bases={bases}
        equipmentTypes={equipmentTypes}
      />

      <Alert>{error}</Alert>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Opening balance" value={t.opening_balance} icon={Archive} tone="stone" hint="At start of period" loading={loading} />
        <StatCard
          label="Net movement"
          value={t.net_movement}
          icon={ArrowLeftRight}
          tone="blue"
          hint="Purchases + In − Out"
          onClick={() => setShowNet(true)}
          loading={loading}
        />
        <StatCard label="Assigned" value={t.assigned} icon={UserCheck} tone="amber" hint="To personnel" loading={loading} />
        <StatCard label="Expended" value={t.expended} icon={Flame} tone="red" hint="Used / written off" loading={loading} />
        <StatCard label="Closing balance" value={t.closing_balance} icon={PackageCheck} tone="army" hint="At end of period" loading={loading} />
      </div>

      <div className="mt-8 mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-lg font-semibold text-stone-900">By equipment</h2>
        {!filters.equipment_type_id && (
          <p className="text-xs text-stone-500">Totals above combine all units. Pick one equipment type for exact counts.</p>
        )}
      </div>
      <DataTable
        columns={BREAKDOWN_COLUMNS}
        rows={data?.by_equipment}
        loading={loading}
        emptyText="No movements for these filters"
      />

      <NetMovementModal open={showNet} onClose={() => setShowNet(false)} filters={filters} totals={t} />
    </div>
  );
}

// Bonus popup: rows behind the Net Movement figure
function NetMovementModal({ open, onClose, filters, totals }) {
  const [tab, setTab] = useState('purchases');
  // Only fetch while open
  const { data, error } = useApi(
    () => (open ? dashboardApi.netMovement(filters) : Promise.resolve(null)),
    `${open}-${JSON.stringify(filters)}`
  );

  const baseCols = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'equipment_name', label: 'Equipment' },
    { key: 'quantity', label: 'Qty', align: 'right', render: (r) => `${formatNumber(r.quantity)} ${r.unit}` },
  ];
  const columns = {
    purchases: [...baseCols.slice(0, 1), { key: 'base_name', label: 'Base' }, ...baseCols.slice(1), { key: 'remarks', label: 'Remarks' }],
    transfers_in: [...baseCols.slice(0, 1), { key: 'from_base_name', label: 'From' }, { key: 'to_base_name', label: 'To' }, ...baseCols.slice(1)],
    transfers_out: [...baseCols.slice(0, 1), { key: 'from_base_name', label: 'From' }, { key: 'to_base_name', label: 'To' }, ...baseCols.slice(1)],
  };

  return (
    <Modal open={open} onClose={onClose} title="Net movement breakdown" wide>
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Summary label="Purchases" value={totals.purchases} sign="+" />
        <Summary label="Transfer in" value={totals.transfer_in} sign="+" />
        <Summary label="Transfer out" value={totals.transfer_out} sign="−" />
      </div>
      <p className="mb-4 text-center text-sm text-stone-600">
        Net movement = <span className="font-semibold text-stone-900">{formatNumber(totals.net_movement)}</span>
      </p>

      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'purchases', label: 'Purchases', count: data?.purchases.length },
            { value: 'transfers_in', label: 'Transfer in', count: data?.transfers_in.length },
            { value: 'transfers_out', label: 'Transfer out', count: data?.transfers_out.length },
          ]}
        />
      </div>
      <DataTable columns={columns[tab]} rows={data?.[tab]} error={error} emptyText="Nothing in this period" />
    </Modal>
  );
}

function Summary({ label, value, sign }) {
  return (
    <div className="rounded-lg bg-stone-50 p-3">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{sign}{formatNumber(value)}</div>
    </div>
  );
}
