import mongoose from 'mongoose';

const dachaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, default: '' },
    capacity: { type: String, default: '' },
    phone: { type: String, default: '' },
    price: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    amenities: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model('Dacha', dachaSchema);