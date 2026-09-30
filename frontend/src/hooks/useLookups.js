import { useApi } from './useApi';
import { lookupApi } from '../api/services';

export function useLookups() {
  const { data, loading } = useApi(() =>
    Promise.all([lookupApi.bases(), lookupApi.equipmentTypes()])
  );
  return {
    bases: data?.[0] ?? [],
    equipmentTypes: data?.[1] ?? [],
    loading,
  };
}
