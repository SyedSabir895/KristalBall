import { expenditureApi } from '../../api/services';
import { useAuth } from '../../hooks/useAuth';
import { useForm, useSubmit } from '../../hooks/useForm';
import { toInputDate } from '../../utils/format';
import { Alert, Field } from '../ui';
import { BaseSelect, EquipmentSelect, FormActions, StockHint } from './fields';

export default function ExpenditureForm({ bases, equipmentTypes, onSaved, onCancel }) {
  const { user } = useAuth();
  const isCommander = user.role === 'BASE_COMMANDER';
  const { values, bind } = useForm({
    base_id: user.base_id ?? '',
    equipment_type_id: '',
    quantity: '',
    reason: '',
    expenditure_date: toInputDate(),
  });
  const { submit, submitting, error } = useSubmit(expenditureApi.create, onSaved);
  const unit = equipmentTypes.find((t) => String(t.id) === String(values.equipment_type_id))?.unit;

  const onSubmit = (e) => {
    e.preventDefault();
    submit({ ...values, quantity: Number(values.quantity) });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Alert>{error}</Alert>
      <Field label="Base">
        <BaseSelect bases={bases} locked={isCommander} {...bind('base_id')} />
      </Field>
      <Field label="Equipment">
        <EquipmentSelect equipmentTypes={equipmentTypes} {...bind('equipment_type_id')} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Quantity"
          hint={<StockHint baseId={values.base_id} equipmentTypeId={values.equipment_type_id} quantity={values.quantity} unit={unit} />}
        >
          <input type="number" min="1" step="1" required className="input" {...bind('quantity')} />
        </Field>
        <Field label="Date">
          <input type="date" required className="input" max={toInputDate()} {...bind('expenditure_date')} />
        </Field>
      </div>
      <Field label="Reason">
        <textarea rows={2} required className="input" placeholder="Training exercise, combat use, write-off…" {...bind('reason')} />
      </Field>
      <FormActions onCancel={onCancel} submitting={submitting} label="Record expenditure" />
    </form>
  );
}
