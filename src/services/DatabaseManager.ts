import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3'

export default class DatabaseManager {
    private db: Database

    private constructor(db: Database) {
        this.db = db
    }

    static async init() {
        const db = await open({
            filename: "./socketTestDb.db",
            driver: sqlite3.Database
        })

        const sqls = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );`
        ]

        try {
            for (const sql of sqls) {
                await db.exec(sql)
            }
            console.log("Successfully initiating sqlite database.")
        } catch (err) {
            console.error(`Error creating tables: ${err}`)
            throw err
        }
        
        return new DatabaseManager(db)
    }
}
