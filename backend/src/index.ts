import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { db } from './db';
import { authRoutes } from './routes/auth';
import { twoFactorRoutes } from './routes/2fa';
import { userRoutes } from './routes/user';
import websocket from '@fastify/websocket';
import { gameGateway } from './gateway/game';

import fs from 'fs';
import path from 'path';

// Load SSL Certs
const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../../certs/key.pem');
const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../../certs/cert.pem');

const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
};

const server = fastify({
    logger: true,
    https: httpsOptions
});

server.register(cors, {
    origin: '*'
});

server.register(websocket);
server.register(gameGateway);

server.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
});

server.register(multipart, {
    limits: {
        fileSize: 5242880 // 5MB
    }
});

server.register(authRoutes, { prefix: '/api/auth' });
server.register(twoFactorRoutes, { prefix: '/api/2fa' });
server.register(userRoutes, { prefix: '/api/users' });

server.get('/', async (request, reply) => {
    return { hello: 'world', project: 'ft_transcendence' };
});

const start = async () => {
    try {
        await server.listen(3000, '0.0.0.0');
        console.log('Server listening on http://0.0.0.0:3000');
        // Ensure DB is initialized
        db.get("SELECT 1", (err) => {
            if (err) console.error("DB Check failed:", err);
            else console.log("DB Check passed");
        });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
