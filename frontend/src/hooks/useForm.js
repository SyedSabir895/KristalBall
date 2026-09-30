import { useState } from 'react';
import { errorMessage } from '../api/client';

export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const bind = (name) => ({
    name,
    value: values[name] ?? '',
    onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
  });
  return { values, setValues, bind };
}

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
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, error, setError };
}
