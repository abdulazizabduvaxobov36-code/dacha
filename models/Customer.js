import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    image: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;