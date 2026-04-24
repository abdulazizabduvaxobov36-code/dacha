import express from 'express';
import { getBot } from '../bot.js';

const router = express.Router();
const otpStore = new Map();

router.post('/send-otp', async (req, res) => {
  const { phone, telegramId } = req.body;
  if (!phone) return res.status(400).json({ message: 'Telefon kerak' });

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  console.log(`[OTP] +998${phone} → ${code}`);

  const bot = getBot();
  if (!bot) {
    // Dev rejim — bot token yo'q
    return res.json({ success: true, devCode: code });
  }

  if (!telegramId) {
    return res.status(400).json({ message: 'Telegram ID aniqlanmadi. Botni qayta oching.' });
  }

  try {
    // telegramId == chatId (private chat uchun)
    await bot.sendMessage(
      telegramId,
      `🔐 Tasdiqlash kodi:\n\n*${code}*\n\n⏱ 5 daqiqa amal qiladi.`,
      { parse_mode: 'Markdown' }
    );
    res.json({ success: true, message: 'Kod yuborildi' });
  } catch (err) {
    console.error('[OTP] Xato:', err.message);
    res.status(500).json({ success: false, message: 'Kod yuborilmadi. Avval botga /start yozing.' });
  }
});

router.post('/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ message: 'Telefon va kod kerak' });

  const stored = otpStore.get(phone);
  if (!stored) return res.status(400).json({ message: 'Kod topilmadi. Qayta so\'rang.' });
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ message: 'Kod muddati o\'tdi. Qayta so\'rang.' });
  }
  if (stored.code !== String(code).trim()) return res.status(400).json({ message: 'Kod noto\'g\'ri' });

  otpStore.delete(phone);
  res.json({ success: true });
});

export default router;
