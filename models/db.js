import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: '35.225.145.80',
  user: 'Tomas',
  password: 'Tomas123',
  database: 'db-ban-bajio-data'
}); 


export default pool;
