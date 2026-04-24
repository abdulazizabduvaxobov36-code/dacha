import express from 'express';
import { getBot } from '../bot.js';

const router = express.Router();
const adminOtpStore = new Map();

// POST /auth/admin-send-otp
router.post('/admin-send-otp', async (req, res) => {
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  if (!adminId) return res.status(500).json({ message: 'Admin ID sozlanmagan' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  adminOtpStore.set('admin', { code, expiresAt: Date.now() + 5 * 60 * 1000 });

  const bot = getBot();
  if (!bot) {
    console.log(`[ADMIN OTP] Dev rejim, kod: ${code}`);
    return res.json({ success: true, devCode: code });
  }

  try {
    await bot.sendMessage(adminId,
      `🔐 *Admin panel* kirish kodi:\n\n*${code}*\n\n⏱ 5 daqiqa amal qiladi.`,
      { parse_mode: 'Markdown' }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[ADMIN OTP] Xato:', err.message);
    res.status(500).json({ message: 'Kod yuborilmadi' });
  }
});

// POST /auth/admin-verify-otp
router.post('/admin-verify-otp', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Kod kerak' });

  const stored = adminOtpStore.get('admin');
  if (!stored) return res.status(400).json({ message: 'Kod topilmadi. Qayta so\'rang.' });
  if (Date.now() > stored.expiresAt) {
    adminOtpStore.delete('admin');
    return res.status(400).json({ message: 'Kod muddati o\'tdi. Qayta so\'rang.' });
  }
  if (stored.code !== String(code).trim()) return res.status(400).json({ message: 'Kod noto\'g\'ri' });

  adminOtpStore.delete('admin');
  res.json({ success: true });
});

export default router;
