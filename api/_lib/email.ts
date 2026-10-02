import { Resend } from 'resend';
import type { Registration } from './ticket';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM   = process.env.EMAIL_FROM || 'VTIS 2026 <noreply@yourdomain.com>';

function daysList(reg: Registration): string {
  const days: string[] = [];
  if (reg.day1) days.push('Day 1 — Altitude Conversation (VIP)');
  if (reg.day2) days.push('Day 2 — The Gathering');
  if (reg.day3) days.push('Day 3 — The Laboratory');
  return days.map(d => `<li>${d}</li>`).join('');
}

export async function sendConfirmationEmail(
  reg: Registration,
  ticketPDF: Buffer,
): Promise<{ success: boolean; error?: string }> {
  const subject = `Congratulations! Your Registration is Confirmed — ${reg.registration_id}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(11,15,46,0.08);">
        <tr><td style="background:#0b0f2e;padding:32px 40px;">
          <p style="margin:0;color:#fff;font-size:24px;font-weight:700;">VTIS <span style="color:#c47a0a;">2026</span></p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Volta Tech &amp; Innovation Summit</p>
        </td></tr>
        <tr><td style="padding:40px 40px 32px;">
          <div style="background:#f5f6fa;border-radius:8px;padding:20px 24px;margin-bottom:28px;text-align:center;">
            <p style="margin:0 0 4px;color:#5c6284;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Your Registration ID</p>
            <p style="margin:0;color:#0b0f2e;font-size:36px;font-weight:700;letter-spacing:-1px;">${reg.registration_id}</p>
          </div>
          <h1 style="margin:0 0 8px;color:#0b0f2e;font-size:26px;font-weight:700;">Congratulations, ${reg.first_name}! 🎉</h1>
          <p style="margin:0 0 24px;color:#5c6284;font-size:16px;line-height:1.6;">Your registration for <strong>VTIS 2026</strong> has been successfully confirmed.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dde0ee;border-radius:8px;overflow:hidden;margin-bottom:28px;">
            <tr style="background:#f5f6fa;"><td style="padding:12px 20px;color:#5c6284;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;width:140px;">Full Name</td><td style="padding:12px 20px;color:#0b0f2e;font-size:14px;font-weight:600;">${reg.first_name} ${reg.last_name}</td></tr>
            <tr><td style="padding:12px 20px;color:#5c6284;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Email</td><td style="padding:12px 20px;color:#0b0f2e;font-size:14px;">${reg.email}</td></tr>
            <tr style="background:#f5f6fa;"><td style="padding:12px 20px;color:#5c6284;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Profile</td><td style="padding:12px 20px;color:#0b0f2e;font-size:14px;">${reg.profile}</td></tr>
            <tr><td style="padding:12px 20px;color:#5c6284;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Attending</td><td style="padding:12px 20px;"><ul style="margin:0;padding-left:18px;color:#0b0f2e;font-size:14px;line-height:1.8;">${daysList(reg)}</ul></td></tr>
          </table>
          <div style="background:#0b0f2e;border-radius:8px;padding:20px 24px;margin-bottom:28px;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Your Ticket</p>
            <p style="margin:0;color:#fff;font-size:14px;line-height:1.6;">Your personalized PDF ticket is attached. Please bring it to the event for check-in.</p>
          </div>
          ${reg.day1 ? `<div style="background:#fff8e6;border:1px solid #f0d090;border-radius:8px;padding:16px 20px;margin-bottom:28px;"><p style="margin:0;color:#8a5e00;font-size:13px;line-height:1.6;"><strong>Day 1 Note:</strong> Attendance on Day 1 requires prior approval. Our team will contact you to confirm your seat.</p></div>` : ''}
          <p style="margin:0;color:#5c6284;font-size:14px;line-height:1.6;">Questions? Contact <a href="mailto:info@vtis2026.com" style="color:#0b0f2e;font-weight:600;">info@vtis2026.com</a></p>
        </td></tr>
        <tr><td style="background:#f5f6fa;padding:24px 40px;border-top:1px solid #dde0ee;">
          <p style="margin:0;color:#5c6284;font-size:12px;text-align:center;">© 2026 VTIS · Organised by <strong>Confluence</strong> · Ho, Volta Region, Ghana</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM, to: reg.email, subject, html,
      attachments: [{
        filename: `VTIS-2026-Ticket-${reg.registration_id.replace(' ', '-')}.pdf`,
        content: ticketPDF.toString('base64'),
      }],
    });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[EMAIL ERROR]', message);
    return { success: false, error: message };
  }
}
