import { db } from '../db';

export interface Match {
    id: number;
    player1_id: number;
    player2_id: number;
    score1: number;
    score2: number;
    winner_id: number;
    played_at: string;
}

export const MatchModel = {
    create: (player1_id: number, player2_id: number, score1: number, score2: number, winner_id: number): Promise<number> => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO matches (player1_id, player2_id, score1, score2, winner_id) VALUES (?, ?, ?, ?, ?)`,
                [player1_id, player2_id, score1, score2, winner_id],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    },

    findByUserId: (userId: number): Promise<Match[]> => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM matches WHERE player1_id = ? OR player2_id = ? ORDER BY played_at DESC`,
                [userId, userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows as Match[]);
                }
            );
        });
    },

    getStats: (userId: number): Promise<{ wins: number; losses: number; total: number }> => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT 
           COUNT(*) as total,
           SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) as wins
         FROM matches 
         WHERE player1_id = ? OR player2_id = ?`,
                [userId, userId, userId],
                (err, row: any) => {
                    if (err) reject(err);
                    else {
                        const wins = row.wins || 0;
                        const total = row.total || 0;
                        resolve({ wins, losses: total - wins, total });
                    }
                }
            );
        });
    }
};
