import Order from '../models/Order.js';

// PATCH /orders/:id/rating
export const updateOrderRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const orderId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Baho 1 dan 5 gacha bo\'lishi kerak' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        rating: parseInt(rating),
        review: review || '',
        ratedAt: new Date()
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Buyurtma topilmadi' });

    res.json({ ok: true, order });
  } catch (err) {
    console.error('updateOrderRating error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /orders/:id/ratings - oshpazning barcha baholari
export const getChefRatings = async (req, res) => {
  try {
    const { chefPhone } = req.params;
    const orders = await Order.find({ 
      chefPhone, 
      rating: { $exists: true, $ne: null },
      status: 'done' 
    }).sort({ ratedAt: -1 });

    const ratings = orders.map(o => ({
      orderId: o._id,
      customerPhone: o.customerPhone,
      customerName: o.customerName,
      rating: o.rating,
      review: o.review,
      ratedAt: o.ratedAt,
      amount: o.amount
    }));

    res.json(ratings);
  } catch (err) {
    console.error('getChefRatings error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// GET /orders/customer/:customerPhone/ratings - mijoz qoldirgan barcha baholar
export const getCustomerRatings = async (req, res) => {
  try {
    const { customerPhone } = req.params;
    const orders = await Order.find({ 
      customerPhone, 
      rating: { $exists: true, $ne: null },
      status: 'done' 
    }).sort({ ratedAt: -1 });

    const ratings = orders.map(o => ({
      orderId: o._id,
      chefPhone: o.chefPhone,
      chefName: o.chefName,
      rating: o.rating,
      review: o.review,
      ratedAt: o.ratedAt,
      amount: o.amount
    }));

    res.json(ratings);
  } catch (err) {
    console.error('getCustomerRatings error:', err.message);
    res.status(500).json({ message: 'Server xatosi' });
  }
};
