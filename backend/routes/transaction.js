import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const [transactions] = await db.query('SELECT * FROM transaction');
        res.send(transactions);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get transactions by user_id
router.get('/user/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const [transactions] = await db.query(
            `SELECT * FROM transaction 
             WHERE buyer_id = ? OR seller_id = ?`,
            [user_id, user_id]
        );
        res.send(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Create a new transaction
router.post('/create', async (req, res) => {
    const { item_id, buyer_id, seller_id } = req.body;

    // Validate input data
    if (!item_id || !buyer_id || !seller_id) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    const transaction_date = new Date().toISOString().split('T')[0];

    try {
        // Check if the item exists
        const [itemExists] = await db.query('SELECT COUNT(*) AS count FROM Item WHERE item_id = ?', [item_id]);
        if (itemExists.count === 0) {
            return res.status(404).send({ error: 'Item not found' });
        }

        // Check if the buyer and seller exist
        const [buyerExists] = await db.query('SELECT COUNT(*) AS count FROM User WHERE id = ?', [buyer_id]);
        const [sellerExists] = await db.query('SELECT COUNT(*) AS count FROM User WHERE id = ?', [seller_id]);
        if (buyerExists.count === 0) {
            return res.status(404).send({ error: 'Buyer not found' });
        }
        if (sellerExists.count === 0) {
            return res.status(404).send({ error: 'Seller not found' });
        }

        const result = await db.query(
            `INSERT INTO Transaction (item_id, buyer_id, seller_id, date)
             VALUES (?, ?, ?, ?)`,
            [item_id, buyer_id, seller_id, transaction_date]
        );

        const newTransaction = {
            trans_id: result.insertId,
            item_id,
            buyer_id,
            seller_id,
            transaction_date
        };

        res.status(201).send(newTransaction);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;
