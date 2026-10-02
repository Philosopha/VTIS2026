import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRegistration, resendEmail, downloadTicketURL, type Registration } from '../lib/api';

function Badge({ on, label }: { on: boolean; label: string }) {
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: on ? '#dcfce7' : '#f1f5f9',
      color:      on ? '#16a34a' : '#64748b',
    }}>
      {on ? `✓ ${label}` : `— ${label}`}
    </span>
  );
}

export default function RegistrationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [reg,     setReg]     = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState('');

  useEffect(() => {
    if (!id) return;
    getRegistration(id).then(setReg).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  async function handleResend() {
    if (!reg) return;
    setMsg('Sending…');
    const res = await resendEmail(reg.registration_id);
    setMsg(res.success ? `✓ ${res.message}` : `✗ ${res.error ?? 'Failed'}`);
    if (res.success) getRegistration(reg.registration_id).then(setReg);
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--muted)' }}>Loading…</div>;
  if (!reg)    return <div style={{ padding: 40, color: 'var(--red)' }}>Not found.</div>;

  const row = (label: string, value: React.ReactNode) => (
    <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '12px 20px', color: 'var(--muted)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', width: 180 }}>{label}</td>
      <td style={{ padding: '12px 20px', color: 'var(--text)', fontSize: 14 }}>{value}</td>
    </tr>
  );

  const days = [reg.day1 && 'Day 1 — Altitude Conversation', reg.day2 && 'Day 2 — The Gathering', reg.day3 && 'Day 3 — The Laboratory'].filter(Boolean).join(', ');

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <Link to="/registrations" style={{ color: 'var(--muted)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to list
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.5 }}>{reg.registration_id}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 2 }}>{reg.first_name} {reg.last_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={downloadTicketURL(reg.registration_id)} download
            style={{ padding: '9px 18px', background: 'var(--ink)', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            ↓ Download Ticket
          </a>
          <button onClick={handleResend}
            style={{ padding: '9px 18px', background: '#fff', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            ✉ Resend Email
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ marginBottom: 20, padding: '10px 16px', borderRadius: 8, fontSize: 13,
          background: msg.startsWith('✓') ? '#dcfce7' : '#fef2f2',
          color:      msg.startsWith('✓') ? 'var(--green)' : 'var(--red)',
        }}>{msg}</div>
      )}

      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {row('Registration ID',  <strong>{reg.registration_id}</strong>)}
            {row('Full Name',        `${reg.first_name} ${reg.last_name}`)}
            {row('Email',            reg.email)}
            {row('Profile',          reg.profile)}
            {row('Days Attending',   days)}
            {row('Registered At',    new Date(reg.registered_at).toLocaleString('en-GB'))}
            {row('Ticket',           <Badge on={reg.ticket_generated} label="Generated" />)}
            {row('Email',            <><Badge on={reg.email_sent} label="Sent" />{reg.email_error && <span style={{ color: 'var(--red)', fontSize: 12, marginLeft: 10 }}>{reg.email_error}</span>}</>)}
            {row('Check-in',         <><Badge on={reg.checked_in} label="Checked In" />{reg.checked_in_at && <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 10 }}>{new Date(reg.checked_in_at).toLocaleString('en-GB')}</span>}</>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
