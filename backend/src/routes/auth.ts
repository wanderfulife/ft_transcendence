import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user';

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/register', async (request, reply) => {
        const { username, email, password } = request.body as any;

        if (!username || !email || !password) {
            return reply.code(400).send({ error: 'Missing fields' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = await UserModel.create(username, email, hashedPassword);
            return { id: userId, username, email };
        } catch (err: any) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return reply.code(409).send({ error: 'Username or email already exists' });
            }
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body as any;

        const user = await UserModel.findByEmail(email);
        if (!user || !user.password) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = fastify.jwt.sign({ id: user.id, username: user.username });

        return { token, user: { id: user.id, username: user.username, email: user.email, is_2fa_enabled: !!user.is_2fa_enabled } };
    });
}
