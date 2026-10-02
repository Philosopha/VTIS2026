// ─────────────────────────────────────────────────────────────────────────────
// CheckInPage.tsx — QR scanner + manual ID lookup for event check-in
// Uses html5-qrcode to access the device camera and decode QR codes.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyTicket, checkInTicket, type VerifyResult } from '../lib/api';

type ScanStatus = 'idle' | 'scanning' | 'found' | 'checking_in' | 'done' | 'error';

export default function CheckInPage() {
  const scannerRef  = useRef<Html5Qrcode | null>(null);
  const [active,    setActive]    = useState(false);
  const [manualId,  setManualId]  = useState('');
  const [status,    setStatus]    = useState<ScanStatus>('idle');
  const [result,    setResult]    = useState<VerifyResult | null>(null);
  const [message,   setMessage]   = useState('');

  // Start / stop camera
  useEffect(() => {
    if (!active) {
      scannerRef.current?.stop().catch(() => {});
      return;
    }

    const qr = new Html5Qrcode('qr-reader');
    scannerRef.current = qr;

    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (text) => { handleScan(text); },
      () => {},
    ).catch(err => {
      console.error(err);
      setMessage('Camera unavailable. Use manual entry below.');
      setActive(false);
    });

    return () => { qr.stop().catch(() => {}); };
  }, [active]);  // eslint-disable-line react-hooks/exhaustive-deps

  async function handleScan(raw: string) {
    if (status === 'scanning' || status === 'checking_in') return;
    setActive(false);
    await lookup(raw.trim().toUpperCase());
  }

  async function lookup(id: string) {
    setStatus('scanning'); setResult(null); setMessage('');
    const data = await verifyTicket(id).catch(() => null);
    if (!data || !data.valid) {
      setStatus('error');
      setMessage('Ticket not found. Check the ID and try again.');
      return;
    }
    setResult(data);
    setStatus('found');
  }

  async function handleCheckIn() {
    if (!result?.registrationId) return;
    setStatus('checking_in');
    const res = await checkInTicket(result.registrationId).catch(() => null);
    if (res?.success) {
      setMessage(res.message ?? 'Checked in!');
      setStatus('done');
      setResult(prev => prev ? { ...prev, checkedIn: true } : prev);
    } else {
      setMessage(res?.error ?? 'Check-in failed');
      setStatus(res?.error === 'already_checked_in' ? 'done' : 'error');
    }
  }

  function reset() {
    setStatus('idle'); setResult(null); setMessage(''); setManualId('');
  }

  const days = result ? [
    result.days?.day1 && 'Day 1',
    result.days?.day2 && 'Day 2',
    result.days?.day3 && 'Day 3',
  ].filter(Boolean).join(', ') : '';

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>QR Check-In</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 32 }}>Scan a participant's QR code or enter their registration ID.</p>

      {/* Camera toggle */}
      {status === 'idle' && (
        <button
          onClick={() => setActive(true)}
          style={{ padding: '12px 28px', background: 'var(--ink)', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 14, border: 'none', marginBottom: 24 }}
        >
          📷 Start Camera Scanner
        </button>
      )}

      {/* QR reader div — html5-qrcode mounts into this */}
      <div id="qr-reader" style={{ width: '100%', marginBottom: active ? 24 : 0, borderRadius: 12, overflow: 'hidden' }} />

      {active && (
        <button onClick={() => setActive(false)}
          style={{ padding: '9px 20px', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, marginBottom: 24 }}>
          Stop Camera
        </button>
      )}

      {/* Manual entry */}
      {(status === 'idle' || status === 'error') && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <input
            value={manualId}
            onChange={e => setManualId(e.target.value.toUpperCase())}
            placeholder="e.g. VTIS 07"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8,
              border: '1px solid var(--border)', fontSize: 14, outline: 'none',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && manualId.trim()) lookup(manualId.trim()); }}
          />
          <button
            onClick={() => manualId.trim() && lookup(manualId.trim())}
            style={{ padding: '10px 20px', background: 'var(--ink)', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none' }}>
            Look Up
          </button>
        </div>
      )}

      {/* Loading */}
      {status === 'scanning' && <p style={{ color: 'var(--muted)' }}>Looking up ticket…</p>}

      {/* Result card */}
      {result && (
        <div style={{
          background: '#fff', border: `2px solid ${result.checkedIn ? 'var(--green)' : 'var(--ink)'}`,
          borderRadius: 14, padding: 24, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{result.registrationId}</p>
              <p style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{result.name}</p>
            </div>
            <span style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: result.checkedIn ? '#dcfce7' : 'var(--surf2)',
              color:      result.checkedIn ? 'var(--green)' : 'var(--muted)',
            }}>
              {result.checkedIn ? '✓ Checked In' : 'Not Checked In'}
            </span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>Profile: <strong style={{ color: 'var(--text)' }}>{result.profile}</strong></p>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>Days: <strong style={{ color: 'var(--text)' }}>{days}</strong></p>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Registered: <strong style={{ color: 'var(--text)' }}>{result.registeredAt ? new Date(result.registeredAt).toLocaleDateString('en-GB') : '—'}</strong></p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {!result.checkedIn && status !== 'done' && (
              <button onClick={handleCheckIn} disabled={status === 'checking_in'}
                style={{ flex: 1, padding: '12px 0', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                {status === 'checking_in' ? 'Checking in…' : '✓ Check In'}
              </button>
            )}
            <button onClick={reset}
              style={{ padding: '12px 20px', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              New Scan
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, fontSize: 13,
          background: status === 'done' ? '#dcfce7' : '#fef2f2',
          color:      status === 'done' ? 'var(--green)' : 'var(--red)',
        }}>
          {message}
        </div>
      )}

      {status === 'done' && (
        <button onClick={reset}
          style={{ marginTop: 16, padding: '10px 22px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Scan Next →
        </button>
      )}
    </div>
  );
}
