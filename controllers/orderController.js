import Order from '../models/Order.js';

// Komissiya foizi — 10%
const COMMISSION_RATE = 0.10;

// ─── OSHPAZ: yangi buyurtma qo'shish ─────────────────────────
// POST /orders
export const createOrder = async (req, res) => {
  try {
    const { customerPhone, customerName, chefPhone, chefName, dishName, amount, chatId, note } = req.body;

    if (!customerPhone || !chefPhone || !amount) {
      return res.status(400).json({ message: 'customerPhone, chefPhone va amount majburiy' });
    }

    const commission = Math.round(amount * COMMISSION_RATE);

    const order = await Order.create({
      customerPhone,
      customerName: customerName || '',
      chefPhone,
      chefName: chefName || '',
      dishName: dishName || 'Buyurtma',
      amount,
      commission,
      chatId: chatId || '',
      note: note || '',
      status: 'new',
    });

    res.status(201).json({ ok: true, order });
  } catch (err) {
    console.error('createOrder error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── OSHPAZ: o'z buyurtmalarini ko'rish ──────────────────────
// GET /orders/chef/:chefPhone
export const getChefOrders = async (req, res) => {
  try {
    const { chefPhone } = req.params;
    const orders = await Order.find({ chefPhone }).sort({ createdAt: -1 });

    // Oshpaz uchun yig'ma hisob
    const totalEarned     = orders.filter(o => o.status === 'done').reduce((s, o) => s + o.amount, 0);
    const totalCommission = orders.filter(o => o.status === 'done').reduce((s, o) => s + o.commission, 0);
    const totalNet        = totalEarned - totalCommission; // oshpazga qolgan

    res.json({
      orders,
      summary: {
        total:       orders.length,
        done:        orders.filter(o => o.status === 'done').length,
        new:         orders.filter(o => o.status === 'new').length,
        totalEarned,
        totalCommission,
        totalNet,
        commissionRate: `${COMMISSION_RATE * 100}%`,
      },
    });
  } catch (err) {
    console.error('getChefOrders error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── OSHPAZ: buyurtma holatini yangilash ─────────────────────
// PATCH /orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'accepted', 'done', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Status noto\'g\'ri' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Buyurtma topilmadi' });

    res.json({ ok: true, order });
  } catch (err) {
    console.error('updateOrderStatus error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── ADMIN: barcha buyurtmalar ───────────────────────────────
// GET /admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, chefPhone } = req.query;
    const filter = {};
    if (status)    filter.status    = status;
    if (chefPhone) filter.chefPhone = chefPhone;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('getAllOrders error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── ADMIN: har bir oshpaz bo'yicha hisob ────────────────────
// GET /admin/commissions
export const getCommissions = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'done' });

    // Oshpazlar bo'yicha guruhlash
    const map = {};
    orders.forEach(o => {
      if (!map[o.chefPhone]) {
        map[o.chefPhone] = {
          chefPhone:        o.chefPhone,
          chefName:         o.chefName,
          ordersCount:      0,
          totalEarned:      0,
          totalCommission:  0,
          totalNet:         0,
        };
      }
      map[o.chefPhone].ordersCount++;
      map[o.chefPhone].totalEarned     += o.amount;
      map[o.chefPhone].totalCommission += o.commission;
      map[o.chefPhone].totalNet        += (o.amount - o.commission);
    });

    const result = Object.values(map).sort((a, b) => b.totalCommission - a.totalCommission);

    // Umumiy yig'ma
    const grandTotal = result.reduce((s, c) => s + c.totalCommission, 0);

    res.json({
      chefs: result,
      grandTotalCommission: grandTotal,
      commissionRate: `${COMMISSION_RATE * 100}%`,
    });
  } catch (err) {
    console.error('getCommissions error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── ADMIN: bitta oshpazning to'liq hisobi ───────────────────
// GET /admin/commissions/:chefPhone
export const getChefCommission = async (req, res) => {
  try {
    const { chefPhone } = req.params;
    const orders = await Order.find({ chefPhone, status: 'done' }).sort({ createdAt: -1 });

    const totalEarned     = orders.reduce((s, o) => s + o.amount, 0);
    const totalCommission = orders.reduce((s, o) => s + o.commission, 0);
    const totalNet        = totalEarned - totalCommission;

    res.json({
      chefPhone,
      chefName:        orders[0]?.chefName || '',
      ordersCount:     orders.length,
      totalEarned,
      totalCommission,
      totalNet,
      commissionRate:  `${COMMISSION_RATE * 100}%`,
      orders,
    });
  } catch (err) {
    console.error('getChefCommission error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};
