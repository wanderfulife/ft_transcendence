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
const userGameMap: Record<number, string> = {}; // Maps userId -> gameId
const queue: { id: number; socket: any }[] = [];

export async function gameGateway(fastify: FastifyInstance) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        // In a real app, we would authenticate via query param token or cookie
        // const userId = authenticate(req);
        // For prototype, we'll assume the client sends an init message with ID

        let userId: number = 0;

        connection.socket.on('message', (message: string) => {
            let data: any;
            try {
                data = JSON.parse(message.toString());
            } catch (e) {
                console.error('Failed to parse message:', message.toString());
                return;
            }

            // console.log(`Received ${data.type} from user context ${userId}`);

            if (data.type === 'INIT') {
                userId = data.userId;
                console.log(`User ${userId} connected`);

                if (data.mode === 'BOT') {
                    console.log(`Starting Bot Game for user ${userId}`);
                    // Create Mock Socket for Bot
                    const botSocket = {
                        readyState: WebSocket.OPEN,
                        send: () => { },
                        on: () => { },
                        close: () => { }
                    } as unknown as WebSocket;

                    startGame(userId, connection.socket, -1, botSocket, true);
                    return;
                }

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
                const gameId = userGameMap[userId];
                if (gameId && sessions[gameId]) {
                    const session = sessions[gameId];
                    const playerNum = session.player1Id === userId ? 1 : 2;
                    session.game.movePaddle(playerNum, data.direction);
                }
            }
        });

        connection.socket.on('close', () => {
            console.log(`User ${userId} disconnected`);

            // Remove from queue
            const index = queue.findIndex(p => p.id === userId);
            if (index !== -1) {
                queue.splice(index, 1);
                console.log(`Removed user ${userId} from queue`);
            }

            // Handle active game
            const gameId = userGameMap[userId];
            if (gameId && sessions[gameId]) {
                const session = sessions[gameId];
                const opponentSocket = session.player1Id === userId ? session.player2 : session.player1;

                // Notify opponent
                if (opponentSocket.readyState === WebSocket.OPEN) {
                    opponentSocket.send(JSON.stringify({ type: 'GAME_OVER', winner: session.player1Id === userId ? 2 : 1, reason: 'Opponent disconnected' }));
                }

                session.game.stop();
                delete sessions[gameId];
                delete userGameMap[session.player1Id];
                delete userGameMap[session.player2Id];
                console.log(`Game ${gameId} ended due to disconnect`);
            }
        });
    });
}

function startGame(p1Id: number, p1Socket: WebSocket, p2Id: number, p2Socket: WebSocket, isBot: boolean = false) {
    // Check sockets before starting
    if (p1Socket.readyState !== WebSocket.OPEN || p2Socket.readyState !== WebSocket.OPEN) {
        console.log('Cannot start game: One or more players disconnected');
        return;
    }

    const gameId = `${p1Id}-${p2Id}-${Date.now()}`;
    console.log(`Starting game ${gameId}`);

    const game = new PongGame(
        (state) => {
            const msg = JSON.stringify({ type: 'UPDATE', state });
            p1Socket.send(msg);
            if (!isBot) p2Socket.send(msg);
        },
        async (winner) => {
            const msg = JSON.stringify({ type: 'GAME_OVER', winner });
            p1Socket.send(msg);
            if (!isBot) p2Socket.send(msg);

            // Record match
            const p1Score = game.state.paddle1.score;
            const p2Score = game.state.paddle2.score;
            const winnerId = winner === 1 ? p1Id : p2Id;
            await MatchModel.create(p1Id, p2Id, p1Score, p2Score, winnerId);

            delete sessions[gameId];
            delete userGameMap[p1Id];
            delete userGameMap[p2Id];
        },
        isBot
    );

    sessions[gameId] = { game, player1: p1Socket, player2: p2Socket, player1Id: p1Id, player2Id: p2Id };
    userGameMap[p1Id] = gameId;
    userGameMap[p2Id] = gameId;

    p1Socket.send(JSON.stringify({ type: 'START', player: 1 }));
    if (!isBot) p2Socket.send(JSON.stringify({ type: 'START', player: 2 }));

    game.start();
}
