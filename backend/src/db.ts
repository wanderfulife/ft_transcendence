import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../db/transcendence.sqlite');

export const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      avatar_url TEXT,
      two_factor_secret TEXT,
      is_2fa_enabled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        // Create Matches table
        db.run(`CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1_id INTEGER,
      player2_id INTEGER,
      score1 INTEGER,
      score2 INTEGER,
      winner_id INTEGER,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(player1_id) REFERENCES users(id),
      FOREIGN KEY(player2_id) REFERENCES users(id)
    )`);
    });
}
