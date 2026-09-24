import { BrevoClient } from '@getbrevo/brevo';

/**
 * Send Password Reset OTP Email via Brevo API
 * @param {Object} params
 * @param {string} params.toEmail
 * @param {string} params.otp
 */
export const sendOtpEmail = async ({ toEmail, otp }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Sky Lounge Restaurant';

  if (!apiKey || !senderEmail) {
    console.warn(
      `[DEV NOTICE] BREVO_API_KEY or BREVO_SENDER_EMAIL is not configured in .env. Simulated OTP for ${toEmail} is: ${otp}`
    );
    return { success: true, simulated: true };
  }

  try {
    const client = new BrevoClient({ apiKey });

    const response = await client.transactionalEmails.sendTransacEmail({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: toEmail }],
      subject: 'Sky Lounge - Password Reset OTP',
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090b; color: #f4f4f5; border-radius: 16px; border: 1px solid #27272a;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #27272a;">
            <h2 style="color: #fbbf24; margin: 0; font-size: 24px; font-weight: 700;">Sky Lounge Restaurant</h2>
            <p style="color: #a1a1aa; font-size: 14px; margin-top: 6px;">Password Reset Verification</p>
          </div>
          
          <div style="padding: 30px 20px; text-align: center;">
            <p style="font-size: 15px; color: #e4e4e7; margin-bottom: 24px;">You requested a password reset for your account. Use the OTP below to complete your verification:</p>
            
            <div style="display: inline-block; background: #18181b; border: 2px solid #fbbf24; border-radius: 12px; padding: 18px 40px; margin: 10px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #fbbf24;">${otp}</span>
            </div>

            <p style="font-size: 16px; font-weight: 600; color: #ffffff; margin-top: 25px;">
              Your password reset OTP is: <span style="color: #fbbf24; font-weight: 700;">${otp}</span>
            </p>

            <ul style="text-align: left; background-color: #18181b; padding: 16px 20px 16px 36px; border-radius: 10px; color: #a1a1aa; font-size: 13px; line-height: 1.7; margin-top: 30px; border: 1px solid #27272a;">
              <li>OTP expires in <strong>10 minutes</strong>.</li>
              <li>Never share this OTP with anyone.</li>
              <li>If you did not request this, please ignore this email.</li>
            </ul>
          </div>

          <div style="text-align: center; border-top: 1px solid #27272a; padding-top: 20px; font-size: 12px; color: #71717a;">
            &copy; ${new Date().getFullYear()} Sky Lounge Restaurant. All rights reserved.
          </div>
        </div>
      `,
    });

    console.log(`[Brevo Email Sent] OTP successfully dispatched to ${toEmail}`);
    return { success: true, response };
  } catch (error) {
    const errorMsg = error?.body?.message || error?.message || String(error);
    console.error('Brevo API Email Error:', errorMsg);

    // Fallback notice if Brevo account SMTP is pending activation so testing is uninterrupted
    if (process.env.NODE_ENV !== 'production' || errorMsg.includes('not yet activated')) {
      console.warn(
        `[DEV NOTICE - BREVO FALLBACK] Brevo account SMTP is pending activation (${errorMsg}). Simulated OTP for ${toEmail} is: ${otp}`
      );
      return { success: true, simulated: true, warning: errorMsg };
    }

    throw new Error(`Failed to send OTP email: ${errorMsg}`);
  }
};
