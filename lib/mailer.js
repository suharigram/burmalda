import nodemailer from 'nodemailer';

let transporter;

function mailTransport() {
  if (!process.env.SMTP_URL) return null;
  if (!transporter) transporter = nodemailer.createTransport(process.env.SMTP_URL);
  return transporter;
}

export async function deliver(subject, message, replyTo, customerEmail) {
  const delivered = [];
  if (process.env.FORM_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.FORM_WEBHOOK_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, replyTo, customerEmail, source: 'clodlegrade.com' }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
      delivered.push('webhook');
    } catch (error) {
      console.error('Webhook delivery failed:', error.message);
    }
  }
  const mail = mailTransport();
  if (mail && process.env.INQUIRY_TO_EMAIL) {
    try {
      await mail.sendMail({ from: process.env.MAIL_FROM || process.env.INQUIRY_TO_EMAIL, to: process.env.INQUIRY_TO_EMAIL, replyTo, subject, text: message });
      delivered.push('email');
      if (customerEmail) {
        await mail.sendMail({
          from: process.env.MAIL_FROM || process.env.INQUIRY_TO_EMAIL,
          to: customerEmail,
          subject: `Clod Le Grade: ${subject}`,
          text: `Thank you for contacting Clod Le Grade.\n\nWe received your request and our team will respond within one business day.\n\nReference: ${subject}\n\n— Clod Le Grade`,
        });
      }
    } catch (error) {
      console.error('Email delivery failed:', error.message);
    }
  }
  return delivered;
}

export function deliveryConfigured() {
  return Boolean(process.env.FORM_WEBHOOK_URL || (process.env.SMTP_URL && process.env.INQUIRY_TO_EMAIL));
}
