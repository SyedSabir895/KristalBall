import { purchaseApi } from '../../api/services';
import { useAuth } from '../../hooks/useAuth';
import { useForm, useSubmit } from '../../hooks/useForm';
import { toInputDate } from '../../utils/format';
import { Alert, Field } from '../ui';
import { BaseSelect, EquipmentSelect, FormActions } from './fields';

export default function PurchaseForm({ bases, equipmentTypes, onSaved, onCancel }) {
  const { user } = useAuth();
  const isCommander = user.role === 'BASE_COMMANDER';
  const { values, bind } = useForm({
    base_id: user.base_id ?? '',
    equipment_type_id: '',
    quantity: '',
    purchase_date: toInputDate(),
    remarks: '',
  });
  const { submit, submitting, error } = useSubmit(purchaseApi.create, onSaved);

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
        <Field label="Quantity">
          <input type="number" min="1" step="1" required className="input" {...bind('quantity')} />
        </Field>
        <Field label="Purchase date">
          <input type="date" required className="input" max={toInputDate()} {...bind('purchase_date')} />
        </Field>
      </div>
      <Field label="Remarks (optional)">
        <textarea rows={2} className="input" placeholder="Supplier, invoice no., notes…" {...bind('remarks')} />
      </Field>
      <FormActions onCancel={onCancel} submitting={submitting} label="Record purchase" />
    </form>
  );
}
