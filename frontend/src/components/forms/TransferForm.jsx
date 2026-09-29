import { ArrowDown } from 'lucide-react';
import { transferApi } from '../../api/services';
import { useAuth } from '../../hooks/useAuth';
import { useForm, useSubmit } from '../../hooks/useForm';
import { toInputDate } from '../../utils/format';
import { Alert, Field } from '../ui';
import { BaseSelect, EquipmentSelect, FormActions, StockHint } from './fields';

export default function TransferForm({ bases, equipmentTypes, onSaved, onCancel }) {
  const { user } = useAuth();
  const isCommander = user.role === 'BASE_COMMANDER';
  const { values, bind } = useForm({
    from_base_id: user.base_id ?? '',
    to_base_id: '',
    equipment_type_id: '',
    quantity: '',
    transfer_date: toInputDate(),
    remarks: '',
  });
  const { submit, submitting, error } = useSubmit(transferApi.create, onSaved);
  const unit = equipmentTypes.find((t) => String(t.id) === String(values.equipment_type_id))?.unit;

  const onSubmit = (e) => {
    e.preventDefault();
    submit({ ...values, quantity: Number(values.quantity) });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Alert>{error}</Alert>
      <Field label="From base">
        <BaseSelect bases={bases} locked={isCommander} {...bind('from_base_id')} />
      </Field>
      <div className="flex justify-center text-stone-400">
        <ArrowDown size={18} />
      </div>
      <Field label="To base">
        {/* Can't send to the same base → hide it from the list */}
        <BaseSelect bases={bases} exclude={values.from_base_id} placeholder="Select destination" {...bind('to_base_id')} />
      </Field>
      <Field label="Equipment">
        <EquipmentSelect equipmentTypes={equipmentTypes} {...bind('equipment_type_id')} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Quantity"
          hint={<StockHint baseId={values.from_base_id} equipmentTypeId={values.equipment_type_id} quantity={values.quantity} unit={unit} />}
        >
          <input type="number" min="1" step="1" required className="input" {...bind('quantity')} />
        </Field>
        <Field label="Transfer date">
          <input type="date" required className="input" max={toInputDate()} {...bind('transfer_date')} />
        </Field>
      </div>
      <Field label="Remarks (optional)">
        <textarea rows={2} className="input" placeholder="Reason, convoy details…" {...bind('remarks')} />
      </Field>
      <FormActions onCancel={onCancel} submitting={submitting} label="Transfer assets" />
    </form>
  );
}
