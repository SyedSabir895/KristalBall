import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  ArrowLeftRight, LayoutDashboard, LogOut, Menu, ScrollText, Shield, ShoppingCart, UserCheck, X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES, ROLE_LABELS } from '../utils/constants';

const ALL = Object.values(ROLES);

// roles = who sees the menu item (must match App.jsx routes + backend rules)
const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ALL },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart, roles: ALL },
  { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight, roles: ALL },
  { to: '/assignments', label: 'Assignments & Expenditures', icon: UserCheck, roles: [ROLES.ADMIN, ROLES.BASE_COMMANDER] },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: [ROLES.ADMIN] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false); // mobile drawer
  const items = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen">
      {/* Mobile backdrop */}
      {menuOpen && (
        <div className="animate-fade-in fixed inset-0 z-30 bg-stone-900/40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar: always visible on desktop, slides in on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-army-900 text-army-100 transition-transform duration-300 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-army-600 p-1.5 text-white"><Shield size={20} /></span>
            <div>
              <div className="font-semibold text-white">KristalBall</div>
              <div className="text-xs text-army-300">Asset Management</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive ? 'bg-army-700 font-medium text-white' : 'text-army-200 hover:bg-army-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-army-800 p-4">
          <div className="text-sm font-medium text-white">{user.name}</div>
          <div className="text-xs text-army-300">
            {ROLE_LABELS[user.role]}
            {user.base_name && ` · ${user.base_name}`}
          </div>
          <button onClick={logout} className="mt-3 flex items-center gap-2 text-sm text-army-200 transition hover:text-white">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="rounded-md p-1 hover:bg-stone-100">
            <Menu size={22} />
          </button>
          <span className="font-semibold text-army-900">KristalBall</span>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
