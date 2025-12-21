import { FastifyInstance } from 'fastify';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { UserModel } from '../models/user';

export async function twoFactorRoutes(fastify: FastifyInstance) {
    // Middleware to ensure user is logged in
    fastify.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    fastify.post('/generate', async (request, reply) => {
        const user = request.user as any;
        const secret = speakeasy.generateSecret({
            name: `ft_transcendence (${user.username})`
        });

        // Store secret temporarily or permanently? 
        // Usually we store it but mark 2FA as disabled until verified.
        await UserModel.update2FA(user.id, secret.base32, false);

        const dataUrl = await qrcode.toDataURL(secret.otpauth_url!);
        return { secret: secret.base32, qrCode: dataUrl };
    });

    fastify.post('/verify', async (request, reply) => {
        const user = request.user as any;
        const { token } = request.body as any;

        const dbUser = await UserModel.findById(user.id);
        if (!dbUser || !dbUser.two_factor_secret) {
            return reply.code(400).send({ error: '2FA not initialized' });
        }

        const verified = speakeasy.totp.verify({
            secret: dbUser.two_factor_secret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            await UserModel.update2FA(user.id, dbUser.two_factor_secret, true);
            return { success: true, message: '2FA enabled' };
        } else {
            return reply.code(401).send({ error: 'Invalid token' });
        }
    });

    fastify.post('/disable', async (request, reply) => {
        const user = request.user as any;
        // In a real app, we should ask for password or 2FA token again before disabling
        await UserModel.update2FA(user.id, '', false);
        return { success: true, message: '2FA disabled' };
    });
}
