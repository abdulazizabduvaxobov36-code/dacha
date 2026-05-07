import Feedback from '../models/Feedback.js';

// POST /feedback — mijoz yoki oshpaz adminга xabar yuboradi
export const sendFeedback = async (req, res) => {
  try {
    const { phone, name, role, message } = req.body;
    if (!phone || !role || !message?.trim()) {
      return res.status(400).json({ message: 'phone, role va message majburiy' });
    }
    if (!['customer', 'chef'].includes(role)) {
      return res.status(400).json({ message: "role faqat 'customer' yoki 'chef' bo'lishi kerak" });
    }

    const fb = await Feedback.create({ phone, name: name || '', role, message: message.trim() });
    res.status(201).json({ ok: true, feedback: fb });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /admin/feedback/customers — mijozlarning xabarlari
export const getCustomerFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ role: 'customer' }).sort({ createdAt: -1 });
    const unreadCount = feedbacks.filter(f => !f.isRead).length;
    res.json({ feedbacks, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /admin/feedback/chefs — oshpazlarning xabarlari
export const getChefFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ role: 'chef' }).sort({ createdAt: -1 });
    const unreadCount = feedbacks.filter(f => !f.isRead).length;
    res.json({ feedbacks, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// PATCH /admin/feedback/:id/read — o'qildi deb belgilash
export const markFeedbackRead = async (req, res) => {
  try {
    const fb = await Feedback.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!fb) return res.status(404).json({ message: 'Topilmadi' });
    res.json({ ok: true, feedback: fb });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// DELETE /admin/feedback/:id — xabarni o'chirish
export const deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};
