import mysql from 'mysql2'

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hotel'
}
const db = mysql.createConnection(dbConfig)
export default db

export function queryAsync(sql: string, params?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}