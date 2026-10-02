import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../lib/api';

const NAV = [
  { to: '/',             label: 'Dashboard',     icon: '▦' },
  { to: '/registrations',label: 'Registrations', icon: '☰' },
  { to: '/checkin',      label: 'Check-In',      icon: '⬡' },
];

export default function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--ink)', display: 'flex',
        flexDirection: 'column', padding: '28px 0', flexShrink: 0,
      }}>
        {/* Wordmark */}
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>
            VTIS <span style={{ color: 'var(--gold)' }}>2026</span>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 2, marginTop: 2, textTransform: 'uppercase' }}>
            Admin Portal
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 24px', fontSize: 14, fontWeight: 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '9px 0', borderRadius: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--surface)' }}>
        <Outlet />
      </main>
    </div>
  );
}
