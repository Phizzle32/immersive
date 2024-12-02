import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all items
router.get('/', async (req, res) => {
    try {
        const [items] = await db.query('SELECT * FROM item');
        res.send(items);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get items by their name or category
router.get('/search', async (req, res) => {
    const { query, category_id } = req.query;
    try {
        let sqlQuery = `
            SELECT * FROM item 
            INNER JOIN category USING (category_id)
            WHERE (item_title LIKE ? OR category_name LIKE ?)`;
        const queryParams = [`%${query}%`, `%${query}%`];

        // If category is provided, filter for items in the category
        if (category_id) {
            sqlQuery += ` AND category_id = ?`
            queryParams.push(category_id);
        }

        sqlQuery += `
            ORDER BY 
                CASE 
                    WHEN item_title LIKE ? THEN 1
                    ELSE 2
                END;`;
        queryParams.push(`%${query}%`);

        const [items] = await db.query(sqlQuery, queryParams);
        res.send(items);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Search a user's items
router.get('/user/:user_id/search', async (req, res) => {
    const { user_id } = req.params;
    const { query, category_id } = req.query;

    let sqlQuery = `
        SELECT * FROM item
        INNER JOIN category USING (category_id)
        WHERE seller_id = ?`;
    const queryParams = [user_id];

    // Add filtering based on item title or category name
    if (query) {
        sqlQuery += ` AND (item_title LIKE ? OR category_name LIKE ?)`;
        queryParams.push(`%${query}%`, `%${query}%`);
    }

    // Add filtering based on category if provided
    if (category_id) {
        sqlQuery += ` AND category_id = ?`;
        queryParams.push(category_id);
    }

    sqlQuery += `
            ORDER BY 
                CASE 
                    WHEN item_title LIKE ? THEN 1
                    ELSE 2
                END;`;
    queryParams.push(`%${query}%`);

    try {
        const [items] = await db.query(sqlQuery, queryParams);
        res.send(items);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get all items of a user
router.get('/user/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const [items] = await db.query('SELECT * FROM item WHERE seller_id = ?', [user_id]);
        res.send(items);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get item by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [item] = await db.query(`
            SELECT item.*, user.name AS seller_name 
            FROM item
            INNER JOIN user ON user.id = item.seller_id
            WHERE item_id = ?`
            , [id]
        );
        if (!item) {
            return res.status(404).send({ message: 'Item not found' });
        }
        res.send(item[0]);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Create a new item
router.post('/create', async (req, res) => {
    const { item_amount, description, seller_id, category_id, quantity, item_title } = req.body;

    // Validate input data
    if (!item_amount || !quantity || !item_title || !seller_id) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    if (item_amount < 0 || quantity < 1) {
        return res.status(400).send({ error: 'Invalid parameters' });
    }

    try {
        // check if user exists
        const [userExists] = await db.query('SELECT COUNT(*) AS count FROM User WHERE id = ?', [seller_id]);
        if (userExists.count === 0) {
            return res.status(404).send({ error: 'Invalid user' });
        }

        // Check if category exists
        let validCategoryId = category_id;
        if (category_id) {
            const [categoryExists] = await db.query('SELECT COUNT(*) AS count FROM Category WHERE category_id = ?', [category_id]);
            if (categoryExists.count === 0) {
                validCategoryId = null;
            }
        }

        const result = await db.query(
            `INSERT INTO Item (item_amount, description, seller_id, category_id, quantity, item_title) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [item_amount, description, seller_id, category_id, quantity, item_title]
        );

        const newItem = {
            item_id: result.insertId,
            item_amount,
            description,
            seller_id,
            category_id: validCategoryId,
            quantity,
            item_title
        };
        res.status(201).send(newItem);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Update an existing item
router.patch('/:item_id', async (req, res) => {
    const { item_id } = req.params;
    const { item_amount, description, seller_id, category_id, quantity, item_title } = req.body;

    // Validate input data
    if (item_amount && item_amount < 0) {
        return res.status(400).send({ error: 'Invalid item amount' });
    }
    if (quantity && quantity < 1) {
        return res.status(400).send({ error: 'Invalid quantity' });
    }

    try {
        // Check if the item exists
        const [itemExists] = await db.query('SELECT COUNT(*) AS count FROM Item WHERE item_id = ?', [item_id]);
        if (itemExists.count === 0) {
            return res.status(404).send({ error: 'Item not found' });
        }

        // If category_id is provided, check if it exists
        let validCategoryId = category_id;
        if (category_id) {
            const [categoryExists] = await db.query('SELECT COUNT(*) AS count FROM Category WHERE category_id = ?', [category_id]);
            if (categoryExists.count === 0) {
                validCategoryId = null;
            }
        }

        // Update the item with the provided fields, only if they are provided
        const updateFields = [];
        const updateValues = [];

        if (item_amount !== undefined) {
            updateFields.push('item_amount = ?');
            updateValues.push(item_amount);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (seller_id !== undefined) {
            updateFields.push('seller_id = ?');
            updateValues.push(seller_id);
        }
        if (validCategoryId !== undefined) {
            updateFields.push('category_id = ?');
            updateValues.push(validCategoryId);
        }
        if (quantity !== undefined) {
            updateFields.push('quantity = ?');
            updateValues.push(quantity);
        }
        if (item_title !== undefined) {
            updateFields.push('item_title = ?');
            updateValues.push(item_title);
        }

        // Check if there are any fields to update
        if (updateFields.length === 0) {
            return res.status(400).send({ error: 'No fields to update' });
        }

        // Add the item_id to the end of the values to target the correct row
        updateValues.push(item_id);

        const query = `UPDATE Item SET ${updateFields.join(', ')} WHERE item_id = ?`;
        await db.query(query, updateValues);

        const updatedItem = {
            item_id,
            item_amount,
            description,
            seller_id,
            category_id: validCategoryId,
            quantity,
            item_title
        };
        res.send(updatedItem);
    } catch (err) {
        console.error('Error updating item:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Delete an item
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the item exists
        const [item] = await db.query('SELECT * FROM item WHERE item_id = ?', [id]);

        if (item.length === 0) {
            return res.status(404).send({ error: 'Item not found' });
        }

        await db.query('DELETE FROM item WHERE item_id = ?', [id]);

        res.status(200).send({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error('Error deleting item:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;