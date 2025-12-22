import { FastifyInstance } from 'fastify';
import { UserModel } from '../models/user';
import { MatchModel } from '../models/match';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import util from 'util';
import { db } from '../db';

const pump = util.promisify(pipeline);
const uploadDir = path.join(__dirname, '../../../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export async function userRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', async (request, reply) => {
        // Allow public access to uploads
        if (request.routerPath?.startsWith('/api/users/uploads')) return;

        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    fastify.get('/me', async (request, reply) => {
        const user = request.user as any;
        const dbUser = await UserModel.findById(user.id);
        if (!dbUser) return reply.code(404).send({ error: 'User not found' });

        // Don't send sensitive data
        const { password, two_factor_secret, ...safeUser } = dbUser;
        return safeUser;
    });

    fastify.get('/:id/stats', async (request, reply) => {
        const { id } = request.params as any;
        const stats = await MatchModel.getStats(id);
        const history = await MatchModel.findByUserId(id);
        return { stats, history };
    });

    // Avatar Upload
    fastify.post('/avatar', async (req, reply) => {
        const user = req.user as any;
        const data = await req.file();
        if (!data) return reply.code(400).send({ error: 'No file uploaded' });

        const filename = `${user.id}-${Date.now()}${path.extname(data.filename)}`;
        const savePath = path.join(uploadDir, filename);

        await pump(data.file, fs.createWriteStream(savePath));

        const avatarUrl = `https://localhost:3000/api/users/uploads/${filename}`;

        // Update DB
        // We'll execute raw query since UserModel might not have update yet
        await new Promise((resolve, reject) => {
            db.run("UPDATE users SET avatar_url = ? WHERE id = ?", [avatarUrl, user.id], (err) => {
                if (err) reject(err); else resolve(true);
            });
        });

        return { success: true, url: avatarUrl };
    });

    // Serve Avatars (Public)
    fastify.get('/uploads/:filename', async (req, reply) => {
        const { filename } = req.params as any;
        const filePath = path.join(uploadDir, filename);
        if (!fs.existsSync(filePath)) return reply.code(404).send('Not Found');
        const stream = fs.createReadStream(filePath);
        return reply.send(stream);
    });
}
