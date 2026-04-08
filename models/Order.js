import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // Kim buyurtma berdi
    customerPhone: { type: String, required: true },
    customerName:  { type: String, default: '' },

    // Qaysi oshpaz
    chefPhone: { type: String, required: true },
    chefName:  { type: String, default: '' },

    // Buyurtma ma'lumoti
    dishName:   { type: String, default: 'Buyurtma' },
    amount:     { type: Number, required: true, min: 0 }, // mijoz to'lagan summa (so'm)
    commission: { type: Number, default: 0 },             // admin ulushi (so'm)

    // Holati
    status: {
      type: String,
      enum: ['new', 'accepted', 'done', 'cancelled'],
      default: 'new',
    },

    // Chatdan kelgan buyurtma ID (ixtiyoriy)
    chatId: { type: String, default: '' },
    note:   { type: String, default: '' },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
