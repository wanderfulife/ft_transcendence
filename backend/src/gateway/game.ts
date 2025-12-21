import { FastifyInstance } from 'fastify';
import { PongGame } from '../game/pong';
import { MatchModel } from '../models/match';
import { WebSocket } from 'ws';

interface GameSession {
    game: PongGame;
    player1: WebSocket;
    player2: WebSocket;
    player1Id: number;
    player2Id: number;
}

const sessions: Record<string, GameSession> = {};
const queue: { id: number; socket: any }[] = [];

export async function gameGateway(fastify: FastifyInstance) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        // In a real app, we would authenticate via query param token or cookie
        // const userId = authenticate(req);
        // For prototype, we'll assume the client sends an init message with ID

        let userId: number = 0;
        let currentGameId: string | null = null;

        connection.socket.on('message', (message: string) => {
            const data = JSON.parse(message.toString());

            if (data.type === 'INIT') {
                userId = data.userId;
                console.log(`User ${userId} connected`);

                // Simple matchmaking
                if (queue.length > 0) {
                    const opponent = queue.shift();
                    if (opponent) {
                        startGame(userId, connection.socket, opponent.id, opponent.socket);
                    }
                } else {
                    queue.push({ id: userId, socket: connection.socket });
                    connection.socket.send(JSON.stringify({ type: 'WAITING' }));
                }
            } else if (data.type === 'MOVE') {
                if (currentGameId && sessions[currentGameId]) {
                    const session = sessions[currentGameId];
                    const playerNum = session.player1Id === userId ? 1 : 2;
                    session.game.movePaddle(playerNum, data.direction);
                }
            }
        });

        connection.socket.on('close', () => {
            // Handle disconnection (forfeit, remove from queue)
        });
    });
}

function startGame(p1Id: number, p1Socket: any, p2Id: number, p2Socket: any) {
    const gameId = `${p1Id}-${p2Id}-${Date.now()}`;
    console.log(`Starting game ${gameId}`);

    const game = new PongGame(
        (state) => {
            const msg = JSON.stringify({ type: 'UPDATE', state });
            p1Socket.send(msg);
            p2Socket.send(msg);
        },
        async (winner) => {
            const msg = JSON.stringify({ type: 'GAME_OVER', winner });
            p1Socket.send(msg);
            p2Socket.send(msg);

            // Record match
            const p1Score = game.state.paddle1.score;
            const p2Score = game.state.paddle2.score;
            const winnerId = winner === 1 ? p1Id : p2Id;
            await MatchModel.create(p1Id, p2Id, p1Score, p2Score, winnerId);

            delete sessions[gameId];
        }
    );

    sessions[gameId] = { game, player1: p1Socket, player2: p2Socket, player1Id: p1Id, player2Id: p2Id };

    p1Socket.send(JSON.stringify({ type: 'START', player: 1 }));
    p2Socket.send(JSON.stringify({ type: 'START', player: 2 }));

    game.start();
}
