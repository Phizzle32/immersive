import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const [reviews] = await db.query('SELECT * FROM review');
        res.send(reviews);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get reviews for a specific item
router.get('/:item_id', async (req, res) => {
    const { item_id } = req.params;
    try {
        const [reviews] = await db.query(`
            SELECT * FROM review
            INNER JOIN user ON user.id = review.reviewer_id
            WHERE item_id = ?`,
            [item_id]);
        res.send(reviews);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get reviews from a specific user
router.get('/user/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const [reviews] = await db.query(`
            SELECT * FROM review
            WHERE reviewer_id = ?`,
            [user_id]);
        res.send(reviews);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Create a new review
router.post('/create', async (req, res) => {
    const { item_id, reviewer_id, comment, rating } = req.body;

    // Validate that all required fields are present
    if (!item_id || !reviewer_id || !comment || !rating) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
        return res.status(400).send({ error: 'Rating must be between 1 and 5' });
    }

    const review_date = new Date().toISOString().split('T')[0];

    try {
        // Check if the item and reviewer exist
        const [itemExists] = await db.query('SELECT COUNT(*) AS count FROM Item WHERE item_id = ?', [item_id]);
        const [userExists] = await db.query('SELECT COUNT(*) AS count FROM User WHERE id = ?', [reviewer_id]);

        if (itemExists.count === 0) {
            return res.status(404).send({ error: 'Invalid item' });
        }
        if (userExists.count === 0) {
            return res.status(404).send({ error: 'Invalid user' });
        }

        // Insert the review into the database
        const [result] = await db.query(
            `INSERT INTO Review (item_id, reviewer_id, review_date, comment, rating) 
             VALUES (?, ?, ?, ?, ?)`,
            [item_id, reviewer_id, review_date, comment, rating]
        );

        const newReview = {
            review_id: result.insertId,
            item_id,
            reviewer_id,
            review_date,
            comment,
            rating
        };
        res.status(201).send(newReview);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Delete a review
router.delete('/:review_id', async (req, res) => {
    const { review_id } = req.params;
    
    try {
        // Check if the review exists before attempting to delete
        const [review] = await db.query('SELECT * FROM review WHERE review_id = ?', [review_id]);
        if (review.length === 0) {
            return res.status(404).send({ message: 'Review not found' });
        }

        await db.query('DELETE FROM review WHERE review_id = ?', [review_id]);

        res.send({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;
