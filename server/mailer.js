import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM || !process.env.SALES_EMAIL) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function deliverRecord(record) {
  const transport = getTransporter();
  if (!transport) return { emailed: false };
  const replyTo = record.email || process.env.SALES_EMAIL;
  const subject = `[GonidonCloud] ${record.type || 'Website inquiry'} · ${record.id}`;
  const text = Object.entries(record)
    .filter(([key]) => !['website', 'consent'].includes(key))
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join('\n');
  await transport.sendMail({ from: process.env.SMTP_FROM, to: process.env.SALES_EMAIL, replyTo, subject, text });
  if (record.email && process.env.SMTP_AUTO_REPLY !== 'false') {
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: record.email,
      subject: `We received your request · ${record.id}`,
      text: `Hello${record.name ? ` ${record.name}` : ''},\n\nThank you for contacting GonidonCloud. Your request has been received under reference ${record.id}. Our team will respond using the contact details you provided.\n\nPlease keep this reference for future correspondence.\n\nGonidonCloud`,
    });
  }
  return { emailed: true };
}

export const isSmtpConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM && process.env.SALES_EMAIL);
