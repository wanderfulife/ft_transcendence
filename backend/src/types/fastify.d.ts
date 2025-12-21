import '@fastify/jwt';

declare module 'fastify' {
    interface FastifyRequest {
        jwtVerify(): Promise<void>;
        user: {
            id: number;
            username: string;
            email?: string;
            is_2fa_enabled?: boolean;
        };
    }
}
