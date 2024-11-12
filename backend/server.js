import express from 'express';
import categoryRoutes from './routes/category.js';
import itemRoutes from './routes/item.js';
import reviewRoutes from './routes/review.js';
import userRoutes from './routes/user.js';
import transactionRoutes from './routes/transaction.js';
import { db, checkDatabaseConnection } from "./database.js";

const app = express();
const PORT = 8080;

checkDatabaseConnection().then(() => {
    app.get('/', (req, res) => {
        res.send('Server is running');
    });

    // API routes
    app.use('/category', categoryRoutes);
    app.use('/item', itemRoutes);
    app.use('/review', reviewRoutes);
    app.use('/user', userRoutes);
    app.use('/transaction', transactionRoutes);

    process.on('SIGINT', () => {
        console.log('Stopping server...');
        db.end();
    });

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.log("Could not connect to database:", error);
    process.exit(1);
} );
