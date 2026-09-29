import { useContext } from 'react';
import { AuthContext } from '../context/authContext';

// const { user, login, logout, hasRole } = useAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  const hasRole = (...roles) => Boolean(ctx.user && roles.includes(ctx.user.role));
  return { ...ctx, hasRole };
}
