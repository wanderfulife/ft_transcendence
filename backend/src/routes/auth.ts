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
    // OAuth 42 Implementation
    const FT_UID = process.env.FT_UID || 'mock_uid';
    const FT_SECRET = process.env.FT_SECRET || 'mock_secret';
    const FT_CALLBACK = process.env.FT_CALLBACK || 'https://localhost:3000/api/auth/callback';

    fastify.get('/42', async (req, reply) => {
        const url = `https://api.intra.42.fr/oauth/authorize?client_id=${FT_UID}&redirect_uri=${encodeURIComponent(FT_CALLBACK)}&response_type=code`;
        reply.redirect(url);
    });

    fastify.get('/callback', async (req: any, reply) => {
        const code = req.query.code;
        if (!code) return reply.code(400).send({ error: 'No code provided' });

        try {
            // 1. Exchange Code for Token
            const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    client_id: FT_UID,
                    client_secret: FT_SECRET,
                    code,
                    redirect_uri: FT_CALLBACK
                })
            });

            // If mock mode (invalid credentials), we might want to simulate success for dev?
            // But strict implementation requires real fetch. If fetch fails (401), we handle error.

            if (!tokenResponse.ok) {
                // For Development/Demo without valid keys, we can SIMULATE a login here if specifically enabled
                if (FT_UID === 'mock_uid') {
                    const mockToken = fastify.jwt.sign({ id: 12345, username: 'mock_42_user' });
                    return reply.redirect(`https://localhost:5173/?token=${mockToken}`);
                }
                throw new Error(`Failed to exchange token: ${tokenResponse.status}`);
            }

            const tokenData = await tokenResponse.json() as any;

            // 2. Get User Info
            const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });

            if (!userResponse.ok) throw new Error('Failed to get user info');
            const userData = await userResponse.json() as any;

            // 3. Find or Create User (Simplification: Auto-login with 42 ID as Ref)
            let user = await UserModel.findByEmail(userData.email);
            if (!user) {
                // Create random password for OAuth user
                const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
                const userId = await UserModel.create(userData.login, userData.email, hashedPassword);
                user = { id: userId, username: userData.login, email: userData.email };
            }

            const token = fastify.jwt.sign({ id: user.id, username: user.username });
            reply.redirect(`https://localhost:5173/?token=${token}`);

        } catch (err) {
            req.log.error(err);
            reply.redirect('https://localhost:5173/login?error=oauth_failed');
        }
    });

}
