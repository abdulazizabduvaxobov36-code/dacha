import TelegramBot from 'node-telegram-bot-api';

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

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const telegramId = String(msg.from?.id);
    const firstName = msg.from?.first_name || 'Foydalanuvchi';

    telegramUsers.set(telegramId, { chatId, firstName });
    console.log(`[Bot] /start: ${firstName} (id: ${telegramId})`);

    bot.sendMessage(chatId,
      `👋 Assalomu alaykum, *${firstName}*!\n\n` +
      `📱 Ilovadan ro'yxatdan o'tganingizda tasdiqlash kodi shu yerga yuboriladi.\n\n` +
      `Quyidagi tugmani bosib ilovani oching:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🍽️ DachaChef ilovasini ochish', web_app: { url: MINI_APP_URL } }
          ]]
        }
      }
    ).then(() => {
      console.log(`[Bot] Xabar yuborildi → ${firstName} (${chatId})`);
    }).catch(err => {
      console.error(`[Bot] Xabar yuborilmadi: ${err.message}`);
    });
  });

  bot.on('polling_error', (err) => console.error('[Bot] Xato:', err.message));
  console.log('✅ Telegram bot ishga tushdi!');
  return bot;
};

export const getBot = () => bot;