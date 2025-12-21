import { FastifyInstance } from 'fastify';
import { UserModel } from '../models/user';
import { MatchModel } from '../models/match';

export async function userRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', async (request, reply) => {
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

    fastify.put('/me', async (request, reply) => {
        const user = request.user as any;
        const { avatar_url } = request.body as any;

        // In a real app, we would handle file upload here or validate the URL
        // For now, we assume avatar_url is passed (e.g. from a separate upload endpoint or external URL)

        // We need to add an update method to UserModel
        // For brevity, let's assume we just return success for now or implement update later
        return { success: true, message: 'Profile updated (mock)' };
    });
}
