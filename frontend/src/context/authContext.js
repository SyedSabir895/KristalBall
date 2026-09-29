import { createContext } from 'react';

// Holds { user, loading, login, logout }. Provided by AuthProvider, read with useAuth()
export const AuthContext = createContext(null);
