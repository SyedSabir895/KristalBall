import { assignmentApi } from '../../api/services';
import { useAuth } from '../../hooks/useAuth';
import { useForm, useSubmit } from '../../hooks/useForm';
import { toInputDate } from '../../utils/format';
import { Alert, Field } from '../ui';
import { BaseSelect, EquipmentSelect, FormActions, StockHint } from './fields';

export default function AssignmentForm({ bases, equipmentTypes, onSaved, onCancel }) {
  const { user } = useAuth();
  const isCommander = user.role === 'BASE_COMMANDER';
  const { values, bind } = useForm({
    base_id: user.base_id ?? '',
    equipment_type_id: '',
    quantity: '',
    personnel_name: '',
    personnel_id: '',
    assignment_date: toInputDate(),
  });
  const { submit, submitting, error } = useSubmit(assignmentApi.create, onSaved);
  const unit = equipmentTypes.find((t) => String(t.id) === String(values.equipment_type_id))?.unit;

  const onSubmit = (e) => {
    e.preventDefault();
    submit({ ...values, quantity: Number(values.quantity) });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Alert>{error}</Alert>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Personnel name">
          <input required className="input" placeholder="Sgt. Rao" {...bind('personnel_name')} />
        </Field>
        <Field label="Service no. (optional)">
          <input className="input" placeholder="IC-12345" {...bind('personnel_id')} />
        </Field>
      </div>
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
        <Field label="Assignment date">
          <input type="date" required className="input" max={toInputDate()} {...bind('assignment_date')} />
        </Field>
      </div>
      <FormActions onCancel={onCancel} submitting={submitting} label="Assign" />
    </form>
  );
}
