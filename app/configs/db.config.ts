import mysql from 'mysql2'

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hotel'
}
const db = mysql.createConnection(dbConfig)
export default db