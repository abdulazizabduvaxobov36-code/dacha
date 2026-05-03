import Chef from '../models/Chef.js';
import Customer from '../models/Customer.js';
import { getBot } from '../bot.js';

// ─── OSHPAZLAR ───────────────────────────────────────────────

// GET /chefs — foydalanuvchilar uchun (bloklanganlarsiz)
export const getAllChefs = async (req, res) => {
  try {
    const chefs = await Chef.find({ isBlocked: false }).sort({ createdAt: -1 });
    res.json(chefs);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /admin/chefs — admin uchun barcha oshpazlar (bloklanganlari bilan)
export const getAllChefsAdmin = async (req, res) => {
  try {
    const chefs = await Chef.find().sort({ createdAt: -1 });
    res.json(chefs);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /chefs/:phone — bitta oshpaz
export const getChefByPhone = async (req, res) => {
  try {
    const chef = await Chef.findOne({ phone: req.params.phone });
    res.json(chef || null);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// POST /chefs — oshpaz qo'shish / yangilash
export const upsertChef = async (req, res) => {
  try {
    const { phone, name, surname, exp, image, bio, telegramId } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone majburiy' });

    const update = { name: name || '', surname: surname || '', exp: exp || '', image: image || '', registeredAt: Date.now() };
    if (bio !== undefined) update.bio = bio;
    if (telegramId) update.telegramId = String(telegramId);

    const chef = await Chef.findOneAndUpdate(
      { phone },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ ok: true, chef });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// PUT /chefs/:phone — oshpaz profilini yangilash
export const updateChef = async (req, res) => {
  try {
    const updates = { ...req.body };
    // telegramId bo'sh bo'lsa o'chirmaymiz
    if (!updates.telegramId) delete updates.telegramId;
    const chef = await Chef.findOneAndUpdate(
      { phone: req.params.phone },
      updates,
      { new: true }
    );
    if (!chef) return res.status(404).json({ message: 'Oshpaz topilmadi' });
    res.json({ ok: true, chef });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// DELETE /chefs/:phone — oshpazni o'chirish
export const deleteChef = async (req, res) => {
  try {
    await Chef.findOneAndDelete({ phone: req.params.phone });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// POST /chefs/:phone/notify — oshpazga Telegram xabar yuborish
export const notifyChef = async (req, res) => {
  try {
    const chef = await Chef.findOne({ phone: req.params.phone });
    if (!chef) return res.status(404).json({ message: 'Oshpaz topilmadi' });
    if (!chef.telegramId) return res.status(400).json({ message: 'Oshpaz hali botga /start yozmagan' });
    const bot = getBot();
    if (!bot) return res.status(500).json({ message: 'Bot ishlamayapti' });
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Xabar matni kerak' });
    await bot.sendMessage(
      chef.telegramId,
      `⚠️ *Admin xabari:*\n\n${message}`,
      { parse_mode: 'Markdown' }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Xato: ' + err.message });
  }
};

// POST /chefs/:phone/link-telegram — mini app dan telegramId ni saqlash
export const linkChefTelegram = async (req, res) => {
  try {
    const { telegramId } = req.body;
    if (!telegramId) return res.status(400).json({ message: 'telegramId kerak' });
    const chef = await Chef.findOneAndUpdate(
      { phone: req.params.phone },
      { telegramId: String(telegramId) },
      { new: true }
    );
    if (!chef) return res.status(404).json({ message: 'Oshpaz topilmadi' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// POST /notify/chef-event — mijoz xabari/buyurtma/bahosi uchun oshpazga Telegram bildirish
export const notifyChefEvent = async (req, res) => {
  try {
    const { chefPhone, type, fromName, extra } = req.body;
    if (!chefPhone) return res.status(400).json({ message: 'chefPhone kerak' });

    const chef = await Chef.findOne({ phone: chefPhone });
    if (!chef?.telegramId) return res.json({ ok: false, reason: 'telegramId yo\'q' });

    const bot = getBot();
    if (!bot) return res.json({ ok: false, reason: 'bot ishlamayapti' });

    const name = fromName || 'Mijoz';
    let text = '';
    if (type === 'message') {
      text = `💬 *${name}* sizga xabar yozdi!\n\nIlovani ochib javob bering.`;
    } else if (type === 'order') {
      const amt = extra?.amount ? `\n💰 Summa: ${Number(extra.amount).toLocaleString('uz-UZ')} so'm` : '';
      const note = extra?.note ? `\n📝 Izoh: ${extra.note}` : '';
      text = `🛍️ *${name}* buyurtma berdi!${amt}${note}\n\nIlovani ochib qabul qiling.`;
    } else if (type === 'review') {
      const stars = '⭐'.repeat(Number(extra?.rating) || 0);
      const cmt = extra?.comment ? `\n💬 "${extra.comment}"` : '';
      text = `${stars} *${name}* baho qo'ydi!${cmt}\n\nProfilda ko'ring.`;
    } else {
      text = `📩 *${name}* sizga murojaat qildi!`;
    }

    const MINI_APP_URL = process.env.MINI_APP_URL || 'https://dachachef-front.vercel.app';
    await bot.sendMessage(chef.telegramId, text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '📱 Ilovani ochish', web_app: { url: MINI_APP_URL } }]]
      }
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Xato: ' + err.message });
  }
};

// PATCH /chefs/:phone/block — bloklash/blokdan chiqarish
export const toggleBlockChef = async (req, res) => {
  try {
    const chef = await Chef.findOne({ phone: req.params.phone });
    if (!chef) return res.status(404).json({ message: 'Oshpaz topilmadi' });
    chef.isBlocked = !chef.isBlocked;
    await chef.save();
    res.json({ ok: true, isBlocked: chef.isBlocked });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── MIJOZLAR ─────────────────────────────────────────────────

// POST /customers — mijoz qo'shish / yangilash
export const upsertCustomer = async (req, res) => {
  try {
    const { phone, firstName, lastName, image } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone majburiy' });

    const customer = await Customer.findOneAndUpdate(
      { phone },
      { firstName: firstName || '', lastName: lastName || '', image: image || '' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ ok: true, customer });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// PUT /customers/:phone — mijoz profilini yangilash
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { phone: req.params.phone },
      { ...req.body },
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: 'Mijoz topilmadi' });
    res.json({ ok: true, customer });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /customers/:phone — bitta mijoz
export const getCustomerByPhone = async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone });
    res.json(customer || null);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /admin/customers — admin uchun barcha mijozlar
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// DELETE /customers/:phone — mijozni o'chirish
export const deleteCustomer = async (req, res) => {
  try {
    await Customer.findOneAndDelete({ phone: req.params.phone });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// PATCH /customers/:phone/block — bloklash/blokdan chiqarish
export const toggleBlockCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone });
    if (!customer) return res.status(404).json({ message: 'Mijoz topilmadi' });
    customer.isBlocked = !customer.isBlocked;
    await customer.save();
    res.json({ ok: true, isBlocked: customer.isBlocked });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};