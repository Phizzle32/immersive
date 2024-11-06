import express from 'express';
import { db } from "./database.js";

const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Server is running');
});

process.on('unhandledRejection', err => {
    console.log(err);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('Stopping server...');
    db.end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
