import TelegramBot from 'node-telegram-bot-api';
import Chef from './models/Chef.js';
import TelegramPhone from './models/TelegramPhone.js';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://dachachef-front.vercel.app';

let bot = null;
export const telegramUsers = new Map();

export const startBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log('[Bot] TELEGRAM_BOT_TOKEN yo\'q — bot ishlamaydi');
    return null;
  }

  // Faqat production (Render) da polling — local da ishlamaydi
  const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';
  if (!isProduction) {
    console.log('[Bot] Local rejim — polling o\'chirilgan (Render da ishlaydi)');
    bot = new TelegramBot(token);
    return bot;
  }

  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const telegramId = String(msg.from?.id);
    const firstName = msg.from?.first_name || 'Foydalanuvchi';

    telegramUsers.set(telegramId, { chatId, firstName });

    // /start <phone> — oshpaz telefon raqamini yuborsa, telegramId ni DB ga saqlash
    const phoneArg = (match[1] || '').trim().replace(/\D/g, '');
    if (phoneArg.length === 9) {
      try {
        await Chef.findOneAndUpdate({ phone: phoneArg }, { telegramId }, { new: false });
        console.log(`[Bot] telegramId ${telegramId} → oshpaz +998${phoneArg} ga saqlandi`);
      } catch (e) {
        console.error('[Bot] Chef telegramId saqlashda xato:', e.message);
      }
    }

    console.log(`[Bot] /start: ${firstName} (id: ${telegramId})`);

    // Oldin telefon saqlangan bo'lsa — ilovaga o'tish tugmasini ko'rsat
    const existing = await TelegramPhone.findOne({ telegramId }).lean().catch(() => null);
    if (existing?.phone) {
      bot.sendMessage(chatId,
        `👋 Xush kelibsiz, *${firstName}*!\n\n✅ Telefon raqamingiz allaqachon saqlangan.\n\nIlovani oching:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🍽️ DachaChef ilovasini ochish', web_app: { url: MINI_APP_URL } }]]
          }
        }
      ).catch(() => {});
    } else {
      // Birinchi marta — telefon so'rash
      bot.sendMessage(chatId,
        `👋 Assalomu alaykum, *${firstName}*!\n\n📱 Davom etish uchun telefon raqamingizni yuboring:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [[{ text: '📱 Telefon raqamimni yuborish', request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          }
        }
      ).catch(() => {});
    }
  });

  // Foydalanuvchi telefon raqamini yubordi
  bot.on('contact', async (msg) => {
    const telegramId = String(msg.from?.id);
    const chatId = msg.chat.id;
    const rawPhone = msg.contact?.phone_number || '';
    // Oxirgi 9 raqamni olamiz (998901234567 → 901234567)
    const phone = rawPhone.replace(/\D/g, '').slice(-9);
    if (!phone || phone.length !== 9) {
      bot.sendMessage(chatId, '❌ Telefon raqami noto\'g\'ri. Qaytadan urinib ko\'ring.').catch(() => {});
      return;
    }

    await TelegramPhone.findOneAndUpdate(
      { telegramId },
      { phone },
      { upsert: true, new: true }
    ).catch(() => {});

    // Chef modelida telegramId saqlash (oshpaz bo'lsa)
    Chef.findOneAndUpdate({ phone }, { telegramId }).catch(() => {});

    const firstName = msg.from?.first_name || 'Foydalanuvchi';
    bot.sendMessage(chatId,
      `✅ Rahmat, *${firstName}*!\n\n` +
      `📞 *+998${phone}* saqlandi.\n\n` +
      `Endi ilovaga kirib ro'yxatdan o'ting:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [[{ text: '🍽️ DachaChef ilovasini ochish', web_app: { url: MINI_APP_URL } }]]
        }
      }
    ).catch(() => {});
  });

  // Admin /reply <userId> <matn> buyrug'i bilan foydalanuvchiga javob beradi
  bot.onText(/\/reply (\d+) (.+)/s, async (msg, match) => {
    const adminId = process.env.ADMIN_TELEGRAM_ID;
    if (!adminId || String(msg.from?.id) !== String(adminId)) return;
    const targetId = match[1];
    const replyText = match[2].trim();
    try {
      await bot.sendMessage(targetId, `👤 *Admin javobi:*\n\n${replyText}`, { parse_mode: 'Markdown' });
      bot.sendMessage(msg.chat.id, `✅ Javob yuborildi → ID: ${targetId}`).catch(() => {});
    } catch (e) {
      bot.sendMessage(msg.chat.id, `❌ Yuborilmadi: ${e.message}`).catch(() => {});
    }
  });

  // /start dan boshqa xabarlarni adminga forward qilish
  bot.on('message', (msg) => {
    if (msg.text?.startsWith('/')) return;
    const adminId = process.env.ADMIN_TELEGRAM_ID;
    if (!adminId) return;
    // Admin o'zi yozgan bo'lsa forward qilmaymiz
    if (String(msg.from?.id) === String(adminId)) return;
    const from = msg.from?.first_name || "Noma'lum";
    const userId = msg.from?.id;
    const text = msg.text || '[fayl/rasm]';
    bot.sendMessage(
      adminId,
      `📩 *${from}* (ID: \`${userId}\`) yozdi:\n\n${text}\n\n` +
      `_Javob berish: /reply ${userId} <matn>_`,
      { parse_mode: 'Markdown' }
    ).catch(() => {});
    bot.sendMessage(msg.chat.id, '✅ Xabaringiz adminga yuborildi. Javob kutib turing!').catch(() => {});
  });

  bot.on('polling_error', (err) => console.error('[Bot] Xato:', err.message));
  console.log('✅ Telegram bot ishga tushdi!');
  return bot;
};

export const getBot = () => bot;