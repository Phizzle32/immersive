import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM user');
        res.send(users);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get a specific user by email
router.get('/email/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const [user] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).send(user[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get a specific user by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [user] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
        res.send(user[0]);
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Create a user
router.post('/create', async (req, res) => {
    const { name, email, phone_number } = req.body;

    // Validate required fields
    if (!name || !email) {
        return res.status(400).send({ error: 'Name and email are required' });
    }

    try {
        // Check if email already exists in the database
        const [existingUser] = await db.query('SELECT * FROM user WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            return res.status(400).send({ error: 'Email already exists' });
        }

        // Insert the new user into the database
        const [result] = await db.query(
            'INSERT INTO user (name, email, phone_number) VALUES (?, ?, ?)',
            [name, email, phone_number || null]
        );

        const newUser = {
            id: result.insertId,
            name,
            email,
            phone_number: phone_number || null
        };
        res.status(201).send(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Update existing user
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone_number } = req.body;

    // Validate that at least one field is provided for update
    if (!name && !email && !phone_number) {
        return res.status(400).send({ error: 'At least one field (name, email, phone_number) is required for update.' });
    }

    try {
        // Check if the user exists
        const [user] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
        if (user.length === 0) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Check if the email is unique 
        if (email) {
            const [existingUser] = await db.query('SELECT * FROM user WHERE email = ? AND id != ?', [email, id]);
            if (existingUser.length > 0) {
                return res.status(400).send({ error: 'Email already exists' });
            }
        }

        // Prepare the SQL update query and values
        const updateFields = [];
        const values = [];

        if (name) {
            updateFields.push('name = ?');
            values.push(name);
        }
        if (email) {
            updateFields.push('email = ?');
            values.push(email);
        }
        if (phone_number) {
            updateFields.push('phone_number = ?');
            values.push(phone_number);
        }

        // Add the user id at the end of the values for the WHERE clause
        values.push(id);

        const query = `UPDATE user SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.query(query, values);

        const [updatedUser] = await db.query('SELECT * FROM user WHERE id = ?', [id]);

        res.status(200).send(updatedUser[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Delete a user
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the user exists
        const [user] = await db.query('SELECT * FROM user WHERE id = ?', [id]);

        if (user.length === 0) {
            return res.status(404).send({ error: 'User not found' });
        }

        await db.query('DELETE FROM user WHERE id = ?', [id]);

        res.status(200).send({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;