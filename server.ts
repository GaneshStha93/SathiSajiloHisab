import express from 'express';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Secure OTP & Grant Token Store
interface ResetTokenRecord {
  token: string;
  target: string;
  method: 'EMAIL' | 'MOBILE';
  username?: string;
  expiresAt: number;
  attempts: number;
}

const resetTokensMap = new Map<string, ResetTokenRecord>();
const resetGrantKeysMap = new Map<string, { username: string; target: string; expiresAt: number }>();

// Helper to get or create nodemailer transport
function getMailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

// ----------------------------------------------------
// AUTH: Send Password Reset Verification Code via Email / SMS
// ----------------------------------------------------
app.post('/api/auth/send-reset-code', async (req, res) => {
  try {
    const { target, method, username } = req.body;
    if (!target || !method) {
      return res.status(400).json({ error: 'Target recipient and recovery method are required.' });
    }

    const cleanTarget = String(target).trim().toLowerCase();
    const token = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    const storeKey = `${method}:${cleanTarget}`;
    resetTokensMap.set(storeKey, {
      token,
      target: cleanTarget,
      method,
      username,
      expiresAt,
      attempts: 0,
    });

    // Mask the target for privacy
    let masked = cleanTarget;
    if (method === 'EMAIL') {
      const parts = cleanTarget.split('@');
      if (parts.length === 2) {
        const u = parts[0];
        const maskedU = u.length > 2 ? `${u[0]}***${u.slice(-1)}` : `${u[0]}***`;
        masked = `${maskedU}@${parts[1]}`;
      }
    } else {
      if (cleanTarget.length >= 6) {
        masked = `${cleanTarget.slice(0, 4)}***${cleanTarget.slice(-3)}`;
      }
    }

    // Dispatch Email if Email Method
    if (method === 'EMAIL') {
      const transporter = getMailTransporter();
      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'Sathi Sajilo Hisab <no-reply@sathi.np>',
            to: cleanTarget,
            subject: `Your Password Reset Code: ${token} - Sathi Sajilo Hisab`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 20px; font-weight: bold; padding: 10px 18px; border-radius: 8px;">
                    साथी सजिलो हिसाब
                  </div>
                  <h2 style="color: #1e293b; margin-top: 14px; font-size: 20px;">Password Reset Verification</h2>
                </div>
                <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                  We received a request to reset your password for your <strong>Sathi Sajilo Hisab ERP</strong> account (${username || cleanTarget}).
                </p>
                <div style="background-color: #f8fafc; border: 2px dashed #93c5fd; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0;">
                  <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1px;">
                    Your 6-Digit Verification Code
                  </div>
                  <div style="font-size: 32px; font-weight: 800; color: #1d4ed8; letter-spacing: 6px; margin-top: 6px; font-family: monospace;">
                    ${token}
                  </div>
                  <div style="font-size: 12px; color: #dc2626; margin-top: 8px; font-weight: 600;">
                    Valid for 10 minutes only
                  </div>
                </div>
                <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
                  <strong>Security Note:</strong> If you did not request this password reset, please ignore this email or notify your system administrator immediately.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <div style="text-align: center; color: #94a3b8; font-size: 11px;">
                  Sathi Sajilo Hisab ERP • 25-Day Cycle Saving & Credit System
                </div>
              </div>
            `,
          });
          console.log(`[AUTH] Password reset email successfully dispatched to ${cleanTarget}`);
        } catch (emailErr) {
          console.error('[AUTH] Failed to send email via SMTP transporter:', emailErr);
        }
      } else {
        console.log(`[AUTH-DISPATCH] Verification code dispatched for ${cleanTarget}. (Configure SMTP_HOST in settings to deliver via custom mail server)`);
      }
    } else if (method === 'MOBILE') {
      // SMS Gateway Dispatch
      if (process.env.SMS_GATEWAY_URL && process.env.SMS_API_KEY) {
        try {
          await fetch(process.env.SMS_GATEWAY_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
            },
            body: JSON.stringify({
              to: cleanTarget,
              message: `Your Sathi Sajilo Hisab ERP verification code is ${token}. Valid for 10 minutes. Do not share with anyone.`,
            }),
          });
          console.log(`[AUTH] SMS verification code sent to ${cleanTarget}`);
        } catch (smsErr) {
          console.error('[AUTH] Failed to send SMS via gateway:', smsErr);
        }
      } else {
        console.log(`[AUTH-DISPATCH] SMS verification code dispatched for ${cleanTarget}.`);
      }
    }

    // Return success WITHOUT exposing the code to the frontend!
    res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to your registered ${method === 'EMAIL' ? 'email' : 'mobile number'}.`,
      maskedTarget: masked,
      method,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/send-reset-code:', error);
    res.status(500).json({ error: error.message || 'Failed to dispatch verification code.' });
  }
});

// ----------------------------------------------------
// AUTH: Verify Password Reset Code
// ----------------------------------------------------
app.post('/api/auth/verify-reset-code', (req, res) => {
  try {
    const { target, method, code } = req.body;
    if (!target || !method || !code) {
      return res.status(400).json({ error: 'Target, method, and 6-digit code are required.' });
    }

    const cleanTarget = String(target).trim().toLowerCase();
    const cleanCode = String(code).trim();
    const storeKey = `${method}:${cleanTarget}`;

    const record = resetTokensMap.get(storeKey);
    if (!record) {
      return res.status(400).json({ error: 'No active verification request found. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      resetTokensMap.delete(storeKey);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      resetTokensMap.delete(storeKey);
      return res.status(429).json({ error: 'Too many invalid attempts. Please request a fresh verification code.' });
    }

    if (record.token !== cleanCode) {
      return res.status(400).json({ error: 'Invalid verification code. Please check your inbox or SMS.' });
    }

    // Success: Generate secure one-time grant key
    const grantKey = crypto.randomBytes(24).toString('hex');
    resetGrantKeysMap.set(grantKey, {
      username: record.username || '',
      target: cleanTarget,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min to complete new password entry
    });

    // Clear used OTP token so it cannot be reused
    resetTokensMap.delete(storeKey);

    res.json({
      success: true,
      resetGrantKey: grantKey,
      message: 'Code verified successfully.',
    });
  } catch (error: any) {
    console.error('Error in /api/auth/verify-reset-code:', error);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// Lazy-initialized Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Sathi Sajilo Hisab ERP',
    timestamp: new Date().toISOString(),
  });
});

// AI Accounting Assistant Route (Gemini 3.7 Flash)
app.post('/api/ai/accounting-assistant', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();
    const systemInstruction = `You are "Sathi AI" (साथी एआई), an expert chartered accountant and cooperative financial advisor specializing in Nepal's small saving & credit groups (बचत तथा ऋण समूह / ढुकुटी / सहकारी) operating under "Sathi Sajilo Hisab".
    
Group Rules & Context:
- Group size: 7 members (friends circle).
- Monthly regular savings: NPR 1,000 per day for 25 days = NPR 25,000 per month per member. Total group monthly deposit target = NPR 175,000.
- 25-Day operational cycle: Saving deposit and interest on loan are collected for 25 days of each month (Day 1 to 25).
- Meeting & official gathering: Conducted from 26th of month to the end of coming month.
- Reinvestment: Funds are disbursed as Regular Loans (12% p.a.) and Emergency Loans (15% p.a.) to members.
- Staff remuneration: Monthly salary of NPR 5,000 paid for bookkeeping and daily collections.
- Accounting principles: Double-entry bookkeeping with strict Debit = Credit balance, Chart of Accounts hierarchy, Day Book entries, Balance Sheet, and P&L.
- Dual Calendar: Bikram Sambat (BS) and Gregorian (AD).

When the user asks to create an entry, prepare a financial analysis, or parse a natural language command (e.g., "Received 25k saving from Bikram in cash", "Disbursed 50k loan to Suresh"), respond clearly in English or Nepali as appropriate.
If the prompt involves creating a voucher, output both a friendly human explanation and a JSON block for the voucher with:
\`\`\`json
{
  "voucherType": "RECEIPT" | "PAYMENT" | "JOURNAL" | "CONTRA",
  "narration": "...",
  "entries": [
    { "ledgerName": "...", "drAmount": 0, "crAmount": 0, "member": "..." }
  ]
}
\`\`\``;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Current ERP Context:\n${JSON.stringify(context || {})}\n\nUser Question/Request: ${prompt}`,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      text: response.text || 'No response generated.',
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process AI accounting request',
    });
  }
});

// Start the server with Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sathi Sajilo Hisab ERP running on http://localhost:${PORT}`);
  });
}

startServer();
