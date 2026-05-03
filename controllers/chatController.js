import Message from '../models/Message.js';

// GET /chats/:chatId — chatdagi xabarlar
export const getMessages = async (req, res) => {
  try {
    const msgs = await Message.find({ chatId: req.params.chatId })
      .sort({ createdAt: 1 }).limit(300);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// POST /chats/:chatId — xabar saqlash
export const saveMessage = async (req, res) => {
  try {
    const { text, sender, from, to, ts } = req.body;
    const msg = await Message.create({
      chatId: req.params.chatId,
      text: text || '', sender: sender || '', from: from || '', to: to || '', ts: ts || '',
    });
    res.status(201).json({ ok: true, msg });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// PATCH /chats/:chatId/read — xabarlarni o'qilgan deb belgilash
export const markRead = async (req, res) => {
  try {
    const { readerPhone } = req.body;
    // readerPhone - kim o'qimoqda: unga yozilgan xabarlarni o'qildi deb belgilaymiz
    await Message.updateMany(
      { chatId: req.params.chatId, to: readerPhone, isRead: false },
      { isRead: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /chats/chef/:chefPhone — oshpazning barcha chatlari (ro'yxat uchun)
export const getChefChats = async (req, res) => {
  try {
    const { chefPhone } = req.params;
    // chatId format: customerPhone_chefPhone
    const msgs = await Message.find({ chatId: { $regex: `_${chefPhone}$` } })
      .sort({ createdAt: -1 });

    // ChatId bo'yicha guruhlash
    const map = {};
    msgs.forEach(m => {
      if (!map[m.chatId]) {
        map[m.chatId] = {
          chatId: m.chatId,
          customerPhone: m.chatId.replace(`_${chefPhone}`, ''),
          lastMsg: m.text,
          lastSender: m.sender,
          time: m.ts,
          unread: 0,
        };
      }
      // Oshpazga yozilgan o'qilmagan xabarlar
      if (m.to === chefPhone && !m.isRead) map[m.chatId].unread++;
    });

    res.json(Object.values(map));
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};
