import { useApi } from '../../hooks/useApi';
import { lookupApi } from '../../api/services';
import { formatNumber } from '../../utils/format';
import { Spinner } from '../ui';

export function BaseSelect({ bases, locked, exclude, placeholder = 'Select base', ...props }) {
  return (
    <select className="input" required disabled={locked} {...props}>
      <option value="">{placeholder}</option>
      {bases
        .filter((b) => String(b.id) !== String(exclude ?? ''))
        .map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
    </select>
  );
}

export function EquipmentSelect({ equipmentTypes, ...props }) {
  const groups = equipmentTypes.reduce((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});
  return (
    <select className="input" required {...props}>
      <option value="">Select equipment</option>
      {Object.entries(groups).map(([category, items]) => (
        <optgroup key={category} label={category}>
          {items.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export function StockHint({ baseId, equipmentTypeId, quantity, unit }) {
  const ready = Boolean(baseId && equipmentTypeId);
  const { data, loading } = useApi(
    () => (ready ? lookupApi.stock(baseId, equipmentTypeId) : Promise.resolve(null)),
    `${baseId}-${equipmentTypeId}`
  );

  if (!ready) return <span className="text-xs text-stone-400">Pick base and equipment to see available stock</span>;
  if (loading && !data) return <Spinner className="size-4" />;
  if (!data) return null;

  const over = Number(quantity) > data.available;
  return (
    <span className={`text-xs font-medium ${over ? 'text-red-600' : 'text-army-700'}`}>
      Available: {formatNumber(data.available)} {unit}
      {over && ' · not enough stock'}
    </span>
  );
}

export function FormActions({ onCancel, submitting, label }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting && <Spinner className="size-4 text-white" />}
        {label}
      </button>
    </div>
  );
}
