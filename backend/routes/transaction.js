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
        const [purchases] = await db.query(
            `SELECT trans_id, item_id, item_title, price, date
             FROM Transaction
             WHERE buyer_id = ?
             ORDER BY date`,
            [user_id]
        );
        const [sales] = await db.query(
            `SELECT trans_id, item_id, item_title, price, date
             FROM Transaction
             WHERE seller_id = ?
             ORDER BY date`,
            [user_id]);

        res.send({ purchases, sales });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Create a new transaction
router.post('/create', async (req, res) => {
    const { itemId, buyerId } = req.body;
    const transaction_date = new Date().toISOString().split('T')[0];

    if (!itemId || !buyerId) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if the item exists and is in stock
        const [item] = await connection.query('SELECT * FROM Item WHERE item_id = ?', [itemId]);
        if (item.length === 0) {
            return res.status(404).send({ error: 'Item not found' });
        } else if (item[0].quantity <= 0) {
            return res.status(400).send({ error: 'Item is out of stock' });
        }

        const { item_title, item_amount: price, seller_id: sellerId } = item[0];

        // Check if the buyer exists
        const [buyer] = await connection.query('SELECT COUNT(*) AS count FROM User WHERE id = ?', [buyerId]);
        if (buyer[0].count === 0) {
            return res.status(404).send({ error: 'Buyer not found' });
        }

        // Reduce the item quantity
        await connection.query('UPDATE item SET quantity = quantity - 1 WHERE item_id = ?', [itemId]);

        // Create the transaction
        const [result] = await connection.query(
            `INSERT INTO Transaction (item_id, item_title, price, buyer_id, seller_id, date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [itemId, item_title, price, buyerId, sellerId, transaction_date]
        );

        // If everything is successful, commit the transaction
        await connection.commit();

        const newTransaction = {
            trans_id: result.insertId,
            item_id: itemId,
            item_title,
            price,
            buyer_id: buyerId,
            seller_id: sellerId,
            transaction_date
        };

        res.status(201).send(newTransaction);
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    } finally {
        connection.release();
    }
});

export default router;
