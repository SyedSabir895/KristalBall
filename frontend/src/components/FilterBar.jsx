import { RotateCcw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CATEGORIES } from '../utils/constants';

// Shared filter row: date range, base, category, equipment type.
// value = { start_date, end_date, base_id, category, equipment_type_id }
// show  = which filters to render, e.g. ['dates', 'base', 'category', 'equipment']
export default function FilterBar({
  value,
  onChange,
  onReset,
  bases,
  equipmentTypes,
  show = ['dates', 'base', 'category', 'equipment'],
  children,
}) {
  const { user } = useAuth();
  const isCommander = user?.role === 'BASE_COMMANDER';
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });

  // Picking a category narrows the equipment list; clear equipment if it no longer fits
  const types = value.category ? equipmentTypes.filter((t) => t.category === value.category) : equipmentTypes;
  const setCategory = (e) => {
    const category = e.target.value;
    const stillValid = equipmentTypes.find(
      (t) => String(t.id) === String(value.equipment_type_id) && (!category || t.category === category)
    );
    onChange({ ...value, category, equipment_type_id: stillValid ? value.equipment_type_id : '' });
  };

  return (
    <div className="card mb-5 grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-6">
      {show.includes('dates') && (
        <>
          <label className="block">
            <span className="label">From</span>
            <input type="date" className="input" value={value.start_date || ''} max={value.end_date || undefined} onChange={set('start_date')} />
          </label>
          <label className="block">
            <span className="label">To</span>
            <input type="date" className="input" value={value.end_date || ''} min={value.start_date || undefined} onChange={set('end_date')} />
          </label>
        </>
      )}

      {show.includes('base') && (
        <label className="block">
          <span className="label">Base</span>
          {isCommander ? (
            // Commander is always scoped to own base (backend enforces this too)
            <select className="input" disabled value="own">
              <option value="own">{user.base_name}</option>
            </select>
          ) : (
            <select className="input" value={value.base_id || ''} onChange={set('base_id')}>
              <option value="">All bases</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
        </label>
      )}

      {show.includes('category') && (
        <label className="block">
          <span className="label">Category</span>
          <select className="input" value={value.category || ''} onChange={setCategory}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
      )}

      {show.includes('equipment') && (
        <label className="block">
          <span className="label">Equipment</span>
          <select className="input" value={value.equipment_type_id || ''} onChange={set('equipment_type_id')}>
            <option value="">All equipment</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
      )}

      {children}

      {onReset && (
        <div className="flex items-end">
          <button type="button" onClick={onReset} className="btn-secondary w-full">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      )}
    </div>
  );
}
