import Message from '../models/Message.js';
import Customer from '../models/Customer.js';

// GET /chats/:chatId?myPhone=xxx — chatdagi xabarlar
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { myPhone } = req.query;

    const allMsgs = await Message.find({ chatId }).sort({ createdAt: 1 }).limit(300);

    // Agar myPhone berilgan bo'lsa — o'zim o'chirgan xabarlarni ko'rsatmaymiz
    const msgs = myPhone
      ? allMsgs.filter(m => !m.deletedBy.includes(myPhone))
      : allMsgs;

    // Hamkor o'chirganligi (partnerDeleted flag)
    let partnerDeleted = false;
    if (myPhone && allMsgs.length > 0) {
      const phones = chatId.split('_');
      const partnerPhone = phones.find(p => p !== myPhone);
      if (partnerPhone) {
        partnerDeleted = allMsgs.some(m => m.deletedBy.includes(partnerPhone));
      }
    }

    res.json({ msgs, partnerDeleted });
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

// DELETE /chats/:chatId — chat o'chirilgan deb belgilash (phone body da keladi)
export const deleteChat = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone talab qilinadi' });

    await Message.updateMany(
      { chatId: req.params.chatId, deletedBy: { $ne: phone } },
      { $push: { deletedBy: phone } }
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

    // Oshpaz o'chirmagan xabarlar
    const msgs = await Message.find({
      chatId: { $regex: `_${chefPhone}$` },
      deletedBy: { $ne: chefPhone },
    }).sort({ createdAt: -1 });

    const map = {};
    msgs.forEach(m => {
      if (!map[m.chatId]) {
        const customerPhone = m.chatId.replace(`_${chefPhone}`, '');
        map[m.chatId] = {
          chatId: m.chatId,
          customerPhone,
          lastMsg: m.text,
          lastSender: m.sender,
          time: m.ts,
          unread: 0,
          partnerDeleted: false,
        };
      }
      if (m.to === chefPhone && !m.isRead) map[m.chatId].unread++;
      // Mijoz o'chirganligi
      const customerPhone = m.chatId.replace(`_${chefPhone}`, '');
      if (m.deletedBy.includes(customerPhone)) map[m.chatId].partnerDeleted = true;
    });

    // Har bir chat uchun mijoz ismini olish
    const chats = Object.values(map);
    const phones = chats.map(c => c.customerPhone);
    const customers = await Customer.find({ phone: { $in: phones } }, 'phone firstName lastName');
    const customerMap = {};
    customers.forEach(c => { customerMap[c.phone] = c; });

    const result = chats.map(chat => {
      const c = customerMap[chat.customerPhone];
      const name = c ? `${c.firstName} ${c.lastName}`.trim() : '';
      return { ...chat, customerName: name || null };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};
