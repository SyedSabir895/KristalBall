import { useState } from 'react';
import { errorMessage } from '../api/client';

// Form values + a bind() helper for inputs:
//   const { values, bind, setValues } = useForm({ quantity: '' });
//   <input {...bind('quantity')} />
export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const bind = (name) => ({
    name,
    value: values[name] ?? '',
    onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
  });
  return { values, setValues, bind };
}

// Wraps a create call with submitting + error state
//   const { submit, submitting, error } = useSubmit(purchaseApi.create, onSaved);
export function useSubmit(apiCall, onSuccess) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(payload) {
    setSubmitting(true);
    setError('');
    try {
      const saved = await apiCall(payload);
      onSuccess?.(saved);
    } catch (err) {
      setError(errorMessage(err)); // e.g. "Insufficient stock. Available: 20, requested: 50"
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, error, setError };
}
