import { useContext } from 'react';
import { AuthContext } from '../context/authContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  const hasRole = (...roles) => Boolean(ctx.user && roles.includes(ctx.user.role));
  return { ...ctx, hasRole };
}
