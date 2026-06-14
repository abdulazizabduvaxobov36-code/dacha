import express from 'express';
import Dacha from '../models/Dacha.js';

const router = express.Router();

// Barcha dachalar
router.get('/', async (req, res) => {
    try {
        const dachas = await Dacha.find().sort({ createdAt: -1 });
        res.json(dachas);
    } catch { res.status(500).json({ error: 'Xato' }); }
});

// Dacha qo'shish
router.post('/', async (req, res) => {
    try {
        const dacha = await Dacha.create(req.body);
        res.json(dacha);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Dacha yangilash
router.put('/:id', async (req, res) => {
    try {
        const dacha = await Dacha.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(dacha);
    } catch { res.status(500).json({ error: 'Xato' }); }
});

// Dacha o'chirish
router.delete('/:id', async (req, res) => {
    try {
        await Dacha.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch { res.status(500).json({ error: 'Xato' }); }
});

export default router;