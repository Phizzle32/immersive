import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

export const db = {
    connect: () => connection.connect(),
    query: (queryString, escapeValues) =>
        new Promise((resolve, reject) => {
            connection.query(queryString, escapeValues, (err, results, fields) => {
                if (err) reject(err);
                resolve({ results, fields });
            })
        }),
    end: () => connection.end()
}
