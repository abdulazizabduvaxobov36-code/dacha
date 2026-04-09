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

// ─── OSHPAZ: mijozning barcha buyurtmalari sonini ko'rish ───────
// GET /orders/customer/:customerPhone/all
export const getCustomerAllOrders = async (req, res) => {
  try {
    const { customerPhone } = req.params;
    const orders = await Order.find({ customerPhone }).sort({ createdAt: -1 });

    // Oshpazlar bo'yicha guruhlash
    const chefsMap = {};
    orders.forEach(o => {
      if (!chefsMap[o.chefPhone]) {
        chefsMap[o.chefPhone] = {
          chefPhone: o.chefPhone,
          chefName: o.chefName,
          ordersCount: 0,
          totalAmount: 0,
        };
      }
      chefsMap[o.chefPhone].ordersCount++;
      chefsMap[o.chefPhone].totalAmount += o.amount;
    });

    const result = Object.values(chefsMap).sort((a, b) => b.totalAmount - a.totalAmount);

    res.json({
      customerPhone,
      totalOrders: orders.length,
      totalAmount: orders.reduce((s, o) => s + o.amount, 0),
      chefs: result,
    });
  } catch (err) {
    console.error('getCustomerAllOrders error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// ─── OSHPAZ: mijozning buyurtmalar sonini ko'rish ───────────────
// GET /orders/customer/:customerPhone/chef/:chefPhone
export const getCustomerOrdersForChef = async (req, res) => {
  try {
    const { customerPhone, chefPhone } = req.params;
    const orders = await Order.find({ customerPhone, chefPhone }).sort({ createdAt: -1 });

    res.json({
      customerPhone,
      chefPhone,
      ordersCount: orders.length,
      totalAmount: orders.reduce((s, o) => s + o.amount, 0),
      orders,
    });
  } catch (err) {
    console.error('getCustomerOrdersForChef error:', err.message);
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

// ─── ADMIN: har bir mijoz-oshpaz juftligi bo'yicha hisob ───────────
// GET /admin/customer-chef-pairs
export const getCustomerChefPairs = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'done' }).sort({ createdAt: -1 });

    // Mijoz-oshpaz juftliklari bo'yicha guruhlash
    const pairsMap = {};
    orders.forEach(o => {
      const pairKey = `${o.customerPhone}_${o.chefPhone}`;
      if (!pairsMap[pairKey]) {
        pairsMap[pairKey] = {
          customerPhone: o.customerPhone,
          customerName: o.customerName || '',
          chefPhone: o.chefPhone,
          chefName: o.chefName || '',
          ordersCount: 0,
          totalEarned: 0,
          totalCommission: 0,
          totalNet: 0,
        };
      }
      pairsMap[pairKey].ordersCount++;
      pairsMap[pairKey].totalEarned += o.amount;
      pairsMap[pairKey].totalCommission += o.commission;
      pairsMap[pairKey].totalNet += (o.amount - o.commission);
    });

    const result = Object.values(pairsMap).sort((a, b) => b.totalNet - a.totalNet);

    res.json({
      pairs: result,
      totalPairs: result.length,
      grandTotalNet: result.reduce((s, p) => s + p.totalNet, 0),
      grandTotalCommission: result.reduce((s, p) => s + p.totalCommission, 0),
      commissionRate: `${COMMISSION_RATE * 100}%`,
    });
  } catch (err) {
    console.error('getCustomerChefPairs error:', err.message);
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
