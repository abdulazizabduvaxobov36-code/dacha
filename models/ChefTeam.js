import mongoose from 'mongoose';

const chefTeamSchema = new mongoose.Schema({
    chefPhone: { type: String, required: true, unique: true },
    counts: { type: Object, default: { ovqat: 0, idish: 0, podacha: 0, boshqa: 0 } },
    prefs: { type: Object, default: { canGo: [], cannotGo: [] } },
}, { timestamps: true });

export default mongoose.model('ChefTeam', chefTeamSchema);