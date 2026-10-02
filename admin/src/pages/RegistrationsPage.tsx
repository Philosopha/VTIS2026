import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listRegistrations, exportCSVURL, type Registration, type ListParams } from '../lib/api';

const LIMIT = 50;

export default function RegistrationsPage() {
  const [rows,    setRows]    = useState<Registration[]>([]);
  const [meta,    setMeta]    = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [params,  setParams]  = useState<ListParams>({ page: 1, limit: LIMIT, sort: 'registration_number', order: 'asc' });

  const load = useCallback(async (p: ListParams) => {
    setLoading(true);
    try {
      const res = await listRegistrations(p);
      setRows(res.data);
      setMeta(res.meta);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(params); }, [params, load]);

  function setParam(key: keyof ListParams, value: string | number) {
    setParams(p => ({ ...p, [key]: value, page: 1 }));
  }

  const inp: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 7, border: '1px solid var(--border)',
    fontSize: 13, color: 'var(--text)', background: '#fff', outline: 'none',
  };

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>Registrations</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{meta.total} total</p>
        </div>
        <a
          href={exportCSVURL({ q: params.q, day: params.day, checked_in: params.checked_in, email_sent: params.email_sent })}
          download
          style={{
            padding: '9px 20px', background: 'var(--ink)', color: '#fff',
            borderRadius: 8, fontSize: 13, fontWeight: 600,
          }}
        >
          ↓ Export CSV
        </a>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search name, email, ID…"
          style={{ ...inp, width: 260 }}
          value={params.q || ''}
          onChange={e => setParam('q', e.target.value)}
        />
        <select style={inp} value={params.day || ''} onChange={e => setParam('day', e.target.value)}>
          <option value="">All Days</option>
          <option value="1">Day 1</option>
          <option value="2">Day 2</option>
          <option value="3">Day 3</option>
        </select>
        <select style={inp} value={params.email_sent || ''} onChange={e => setParam('email_sent', e.target.value)}>
          <option value="">Email: All</option>
          <option value="true">Email Sent</option>
          <option value="false">Email Pending</option>
        </select>
        <select style={inp} value={params.checked_in || ''} onChange={e => setParam('checked_in', e.target.value)}>
          <option value="">Check-in: All</option>
          <option value="true">Checked In</option>
          <option value="false">Not Checked In</option>
        </select>
        <button
          onClick={() => setParams({ page: 1, limit: LIMIT, sort: 'registration_number', order: 'asc' })}
          style={{ ...inp, background: 'var(--surf2)', cursor: 'pointer' }}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surf2)', borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Name', 'Email', 'Profile', 'Days', 'Registered', 'Email', 'Check-in', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No results</td></tr>
              ) : rows.map((r, idx) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 ? 'var(--surface)' : '#fff' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{r.registration_id}</td>
                  <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>{r.first_name} {r.last_name}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.email}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.profile}</td>
                  <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                    {[r.day1 && 'D1', r.day2 && 'D2', r.day3 && 'D3'].filter(Boolean).join(' ')}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {new Date(r.registered_at).toLocaleDateString('en-GB')}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: r.email_sent ? '#dcfce7' : '#fef9c3',
                      color:      r.email_sent ? 'var(--green)' : '#92400e' }}>
                      {r.email_sent ? '✓ Sent' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: r.checked_in ? '#dcfce7' : 'var(--surf2)',
                      color:      r.checked_in ? 'var(--green)' : 'var(--muted)' }}>
                      {r.checked_in ? '✓ In' : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link to={`/registrations/${r.registration_id}`}
                      style={{ color: 'var(--blue)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              Page {meta.page} of {meta.pages} · {meta.total} records
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button disabled={meta.page <= 1}
                onClick={() => setParams(p => ({ ...p, page: p.page! - 1 }))}
                style={{ ...inp, cursor: meta.page <= 1 ? 'default' : 'pointer', opacity: meta.page <= 1 ? 0.4 : 1 }}>
                ← Prev
              </button>
              <button disabled={meta.page >= meta.pages}
                onClick={() => setParams(p => ({ ...p, page: p.page! + 1 }))}
                style={{ ...inp, cursor: meta.page >= meta.pages ? 'default' : 'pointer', opacity: meta.page >= meta.pages ? 0.4 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
