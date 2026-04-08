import mongoose from 'mongoose';

const chefSchema = new mongoose.Schema(
  {
    phone:       { type: String, required: true, unique: true },
    name:        { type: String, default: '' },
    surname:     { type: String, default: '' },
    exp:         { type: String, default: '' },
    image:       { type: String, default: '' },
    isBlocked:   { type: Boolean, default: false },
    registeredAt:{ type: Number, default: () => Date.now() },
  },
  { timestamps: true }
);

const Chef = mongoose.model('Chef', chefSchema);
export default Chef;
