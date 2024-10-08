import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3'
import { Effect } from 'effect';
import { User } from '../models/User';
import { AuthenticationError, InternalError } from '../utils/errors';

export default class DatabaseService {
    private db: Database

    private constructor(db: Database) {
        this.db = db
    }

    static async init(): Promise<DatabaseService> {
        const db = await open({
            filename: "./database.db",
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
            return new DatabaseService(db)
        } catch (err) {
            throw new InternalError(`Failed to create tables: ${err}`)
        }
    }

    public async createUser(username: string, password_hash: string): Promise<Effect.Effect<boolean, Error>> {
        try {
            const currentUser = await this.db.get(`SELECT * FROM users WHERE username = ?`, [username])
            if (currentUser) {
                return Effect.fail(new AuthenticationError(`Failed to create user: Username has been used.`))
            }
            await this.db.run(`INSERT INTO users (username, password_hash) VALUES (?, ?)`, [username, password_hash])
            return Effect.succeed(true)
        } catch (e) {
            return Effect.fail(new InternalError(`Failed to create user: ${e}`))
        }
    }

    public async getUser(id: number): Promise<Effect.Effect<User, Error>> {
        try {
            const row = await this.db.get(`SELECT * FROM users WHERE id = ?`, [id])
            return row ? Effect.succeed(row) : Effect.fail(new AuthenticationError(`Failed to get user: User with provided user_id is not found.`))
        } catch (e) {
            return Effect.fail(new InternalError(`Failed to get user: ${e}`))
        }
    }
}
