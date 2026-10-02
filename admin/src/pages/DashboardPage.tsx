import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats, type Stats } from '../lib/api';

function StatCard({ value, label, color }: { value: number | undefined; label: string; color: string }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
      padding: '24px 28px', boxShadow: '0 1px 4px rgba(11,15,46,0.05)',
    }}>
      <p style={{ fontSize: '2.2rem', fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>
        {value ?? '—'}
      </p>
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { getStats().then(setStats).catch(console.error); }, []);

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 36 }}>
        VTIS 2026 registration overview
      </p>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard value={stats?.total}       label="Total Registrations"  color="var(--ink)"  />
        <StatCard value={stats?.emailsSent}  label="Emails Sent"          color="var(--blue)" />
        <StatCard value={stats?.checkedIn}   label="Checked In"           color="var(--green)"/>
        <StatCard value={stats?.byDay.day1}  label="Day 1 Attendees"      color="var(--gold)" />
        <StatCard value={stats?.byDay.day2}  label="Day 2 Attendees"      color="var(--pink)" />
        <StatCard value={stats?.byDay.day3}  label="Day 3 Attendees"      color="var(--blue)" />
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/registrations" style={{
          padding: '10px 22px', background: 'var(--ink)', color: '#fff',
          borderRadius: 8, fontSize: 13, fontWeight: 600,
        }}>
          View All Registrations →
        </Link>
        <Link to="/checkin" style={{
          padding: '10px 22px', background: '#fff', color: 'var(--ink)',
          border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 600,
        }}>
          QR Check-In Scanner
        </Link>
      </div>
    </div>
  );
}
