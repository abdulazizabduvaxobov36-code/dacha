import TelegramBot from 'node-telegram-bot-api';

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://dachachef-front.vercel.app';

let bot = null;

export const startBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log('[Bot] TELEGRAM_BOT_TOKEN yo\'q — bot ishlamaydi');
    return null;
  }

  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || 'Foydalanuvchi';

    bot.sendMessage(
      chatId,
      `👋 *${firstName}*, xush kelibsiz!\n\n🍽️ *OSHPAZ.UZ* — uyda tayyorlangan taomlar platformasi.\n\nQuyidagi tugmani bosib kirish mumkin:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🍽️ OSHPAZ.UZ ni ochish',
              web_app: { url: MINI_APP_URL }
            }
          ]]
        }
      }
    );
  });

  bot.on('polling_error', (err) => {
    console.error('[Bot] Polling xatosi:', err.message);
  });

  console.log('✅ Telegram bot ishga tushdi (polling)');
  return bot;
};

export const getBot = () => bot;
