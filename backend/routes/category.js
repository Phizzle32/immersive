import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM category');
        res.send(categories);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get categories by name
router.get('/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const [categories] = await db.query(
            'SELECT * FROM category WHERE category_name LIKE ?',
            [`%${name}%`]
        );
        res.send(categories);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;