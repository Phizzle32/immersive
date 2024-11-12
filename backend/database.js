import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise();

export const checkDatabaseConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log('Database connection established');
        connection.release();
    } catch (err) {
        throw new Error(err);
    }
};