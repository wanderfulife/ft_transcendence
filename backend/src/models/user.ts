import { db } from '../db';

export interface User {
    id: number;
    username: string;
    email: string;
    password?: string;
    avatar_url?: string;
    two_factor_secret?: string;
    is_2fa_enabled: number; // 0 or 1
    created_at: string;
}

export const UserModel = {
    create: (username: string, email: string, passwordHash: string): Promise<number> => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
                [username, email, passwordHash],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    },

    findByEmail: (email: string): Promise<User | undefined> => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
                if (err) reject(err);
                else resolve(row as User);
            });
        });
    },

    findById: (id: number): Promise<User | undefined> => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row as User);
            });
        });
    },

    update2FA: (id: number, secret: string, enabled: boolean): Promise<void> => {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE users SET two_factor_secret = ?, is_2fa_enabled = ? WHERE id = ?`,
                [secret, enabled ? 1 : 0, id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
    }
};
