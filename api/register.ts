import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { supabase } from './_lib/supabase';
import { generateTicketPDF, type Registration } from './_lib/ticket';
import { sendConfirmationEmail } from './_lib/email';
import { cors } from './_lib/auth';

const Schema = z.object({
  firstName: z.string().min(1).max(80).trim(),
  lastName:  z.string().min(1).max(80).trim(),
  email:     z.string().email().toLowerCase().trim(),
  profile:   z.string().min(1).max(100).trim(),
  days: z.object({
    day1: z.boolean(), day2: z.boolean(), day3: z.boolean(),
  }).refine(d => d.day1 || d.day2 || d.day3, { message: 'Select at least one day' }),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });

  const { firstName, lastName, email, profile, days } = parsed.data;

  // Duplicate check
  const { data: existing } = await supabase
    .from('registrations').select('registration_id').eq('email', email).maybeSingle();
  if (existing) return res.status(409).json({
    error: 'duplicate_email',
    message: `This email is already registered (${existing.registration_id}).`,
  });

  // Insert registration
  const { data: newReg, error: insertError } = await supabase
    .from('registrations')
    .insert({ first_name: firstName, last_name: lastName, email, profile, day1: days.day1, day2: days.day2, day3: days.day3 })
    .select().single();

  if (insertError || !newReg) {
    if (insertError?.code === '23505') return res.status(409).json({ error: 'duplicate_email', message: 'This email is already registered.' });
    console.error('[DB INSERT]', insertError);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }

  const reg = newReg as Registration;
  const ticketUrl = `${process.env.BACKEND_URL || 'https://vtis-2026.vercel.app'}/api/ticket/${encodeURIComponent(reg.registration_id)}`;

  // Generate ticket PDF and send email BEFORE responding (Vercel kills async work after res.json)
  let emailSent = false;
  let emailError: string | undefined;
  try {
    await generateTicketPDF(reg);
    const emailResult = await sendConfirmationEmail(reg, ticketUrl);
    emailSent  = emailResult.success;
    emailError = emailResult.error;
    console.log(`[EMAIL] ${emailSent ? 'sent' : 'failed'} for ${reg.registration_id}`);
  } catch (err) {
    emailError = err instanceof Error ? err.message : String(err);
    console.error('[EMAIL ERROR]', emailError);
  }

  // Update DB with ticket and email status
  await supabase.from('registrations').update({
    ticket_generated: true,
    ticket_url:       ticketUrl,
    email_sent:       emailSent,
    email_sent_at:    emailSent ? new Date().toISOString() : null,
    email_error:      emailError ?? null,
  }).eq('id', reg.id);

  // Respond to client
  return res.status(201).json({
    success:        true,
    registrationId: reg.registration_id,
    message:        `Registration confirmed! Your ID is ${reg.registration_id}.`,
  });
}
