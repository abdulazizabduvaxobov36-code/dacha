import express from 'express';
import ChefTeam from '../models/ChefTeam.js';

const router = express.Router();

// Oshpaz komandasi va dacha prefs olish
router.get('/:phone', async (req, res) => {
    try {
        const data = await ChefTeam.findOne({ chefPhone: req.params.phone });
        if (!data) return res.json({ counts: {}, prefs: { canGo: [], cannotGo: [] } });
        res.json({ counts: data.counts, prefs: data.prefs });
    } catch { res.status(500).json({ error: 'Xato' }); }
});

// Komanda saqlash
router.put('/:phone/team', async (req, res) => {
    try {
        await ChefTeam.findOneAndUpdate(
            { chefPhone: req.params.phone },
            { $set: { counts: req.body.counts } },
            { upsert: true, new: true }
        );
        res.json({ ok: true });
    } catch { res.status(500).json({ error: 'Xato' }); }
});

// Dacha prefs saqlash
router.put('/:phone/prefs', async (req, res) => {
    try {
        await ChefTeam.findOneAndUpdate(
            { chefPhone: req.params.phone },
            { $set: { prefs: req.body.prefs } },
            { upsert: true, new: true }
        );
        res.json({ ok: true });
    } catch { res.status(500).json({ error: 'Xato' }); }
});

export default router;