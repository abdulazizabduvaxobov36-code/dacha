import TelegramBot from 'node-telegram-bot-api';
import Chef from './models/Chef.js';
import TelegramPhone from './models/TelegramPhone.js';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://dachachef-front.vercel.app';

let bot = null;
export const telegramUsers = new Map();

// adminMsgId → userChatId (global, feedbackController ham ishlatadi)
export const replyMap = new Map();

// Adminga xabar yuborib, replyMap ga yozish
export const sendToAdmin = async (text, userChatId) => {
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  if (!adminId || !bot) return;
  try {
    const sent = await bot.sendMessage(adminId, text, { parse_mode: 'Markdown' });
    if (userChatId) {
      replyMap.set(sent.message_id, userChatId);
      if (replyMap.size > 500) {
        replyMap.delete(replyMap.keys().next().value);
      }
    }
  } catch { }
};

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
      ).catch(() => { });
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
      ).catch(() => { });
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
      bot.sendMessage(chatId, '❌ Telefon raqami noto\'g\'ri. Qaytadan urinib ko\'ring.').catch(() => { });
      return;
    }

    await TelegramPhone.findOneAndUpdate(
      { telegramId },
      { phone },
      { upsert: true, new: true }
    ).catch(() => { });

    // Chef modelida telegramId saqlash (oshpaz bo'lsa)
    Chef.findOneAndUpdate({ phone }, { telegramId }).catch(() => { });

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
    ).catch(() => { });
  });

  // /start dan boshqa xabarlarni adminga forward qilish
  const processedMsgIds = new Set();
  bot.on('message', async (msg) => {
    if (msg.text?.startsWith('/')) return;
    if (msg.contact) return;
    if (msg.web_app_data) return;
    if (msg.photo || msg.video || msg.document || msg.audio || msg.sticker || msg.voice) return;
    if (!msg.text || msg.text.trim() === '') return;
    // Takroriy ishlamasin
    if (processedMsgIds.has(msg.message_id)) return;
    processedMsgIds.add(msg.message_id);
    if (processedMsgIds.size > 1000) {
      const first = processedMsgIds.values().next().value;
      processedMsgIds.delete(first);
    }
    const adminId = process.env.ADMIN_TELEGRAM_ID;
    if (!adminId) return;

    // Admin o'zi yozgan bo'lsa — Reply bilan javob berayaptimi?
    if (String(msg.from?.id) === String(adminId)) {
      const repliedTo = msg.reply_to_message?.message_id;
      if (repliedTo && replyMap.has(repliedTo)) {
        const userChatId = replyMap.get(repliedTo);
        try {
          await bot.sendMessage(userChatId, `👤 *Admin javobi:*\n\n${msg.text}`, { parse_mode: 'Markdown' });
          bot.sendMessage(adminId, '✅ Javob yuborildi!').catch(() => { });
        } catch (e) {
          bot.sendMessage(adminId, `❌ Yuborilmadi: ${e.message}`).catch(() => { });
        }
      }
      return;
    }

    // Oddiy foydalanuvchi xabari — adminga yuborish
    const from = msg.from?.first_name || "Noma'lum";
    const userChatId = msg.chat.id;
    const text = msg.text || '[fayl/rasm]';
    try {
      const sent = await bot.sendMessage(
        adminId,
        `📩 *${from}* yozdi:\n\n${text}\n\n_Javob berish uchun shu xabarga Reply bosing_`,
        { parse_mode: 'Markdown' }
      );
      // Reply xaritasiga qo'shish (admin shu xabarga Reply bossa userga boradi)
      replyMap.set(sent.message_id, userChatId);
      // Xarita haddan katta bo'lib ketmasin
      if (replyMap.size > 500) {
        const firstKey = replyMap.keys().next().value;
        replyMap.delete(firstKey);
      }
    } catch { }
    bot.sendMessage(userChatId, '✅ Xabaringiz adminga yuborildi. Javob kutib turing!').catch(() => { });
  });

  bot.on('polling_error', (err) => console.error('[Bot] Xato:', err.message));
  console.log('✅ Telegram bot ishga tushdi!');
  return bot;
};

export const getBot = () => bot;