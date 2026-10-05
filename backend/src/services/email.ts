// ─────────────────────────────────────────────────────────────────────────────
// services/email.ts — send VTIS confirmation email via Brevo
// ─────────────────────────────────────────────────────────────────────────────

import * as Brevo from '@getbrevo/brevo';
import type { Registration } from '../types';

const FROM_NAME  = 'Volta Tech & Innovation Summit 2026';
const FROM_EMAIL = 'voltatechinnovationsummit@gmail.com';

function buildHtml(reg: Registration, ticketUrl: string): string {
  const name   = `${reg.first_name} ${reg.last_name}`;
  const vtisId = reg.registration_id;

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VTIS 2026 Registration Confirmation</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#111827;padding:35px 30px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:30px;">VTIS 2026</h1>
        <p style="margin:10px 0 0;color:#d1d5db;font-size:15px;">Registration Confirmation</p>
      </div>

      <!-- Content -->
      <div style="padding:35px 30px;">
        <h2 style="margin-top:0;font-size:24px;">Congratulations, ${name}! 🎉</h2>
        <p style="font-size:16px;line-height:1.7;color:#4b5563;">
          Your registration for <strong>VTIS 2026</strong> has been successfully completed.
        </p>
        <p style="font-size:16px;line-height:1.7;color:#4b5563;">
          Please keep your registration ID below safe. You may need it when attending the event.
        </p>

        <!-- VTIS ID -->
        <div style="margin:30px 0;padding:20px;background:#f3f4f6;border-radius:10px;text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">
            Your VTIS Registration ID
          </p>
          <h2 style="margin:0;font-size:28px;color:#111827;">${vtisId}</h2>
        </div>

        <!-- Details -->
        <h3 style="font-size:18px;margin-bottom:12px;">Your Registration</h3>
        <p style="margin:6px 0;font-size:15px;color:#4b5563;"><strong>Name:</strong> ${name}</p>
        <p style="margin:6px 0;font-size:15px;color:#4b5563;"><strong>Email:</strong> ${reg.email}</p>
        <p style="margin:6px 0;font-size:15px;color:#4b5563;"><strong>Profile:</strong> ${reg.profile}</p>

        <!-- Ticket button -->
        <div style="margin:30px 0;text-align:center;">
          <a href="${ticketUrl}" style="display:inline-block;padding:14px 28px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">
            View / Download Your Ticket
          </a>
        </div>

        <p style="font-size:14px;line-height:1.6;color:#6b7280;">
          Please save your ticket and have it available when attending VTIS 2026.
        </p>
        <p style="font-size:16px;line-height:1.6;margin-top:30px;">
          We look forward to seeing you at <strong>VTIS 2026</strong>.
        </p>
        <p style="margin-bottom:0;font-size:15px;color:#4b5563;">
          Best regards,<br /><strong>VTIS 2026 Team</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="padding:20px 30px;background:#f9fafb;text-align:center;color:#9ca3af;font-size:12px;">
        © 2026 VTIS. All rights reserved.
      </div>
    </div>
  </body>
</html>`.trim();
}

export async function sendConfirmationEmail(
  reg: Registration,
  ticketUrl: string,
): Promise<{ success: boolean; error?: string }> {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY!,
  );

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.sender      = { name: FROM_NAME, email: FROM_EMAIL };
  sendSmtpEmail.to          = [{ email: reg.email, name: `${reg.first_name} ${reg.last_name}` }];
  sendSmtpEmail.subject     = `Congratulations! Your Registration is Confirmed — ${reg.registration_id}`;
  sendSmtpEmail.htmlContent = buildHtml(reg, ticketUrl);

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Brevo email sent:', response.body);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[BREVO EMAIL ERROR]', message);
    return { success: false, error: message };
  }
}
