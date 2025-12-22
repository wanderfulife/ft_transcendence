import { useEffect, useRef, useState } from 'react';

interface GameState {
    ball: { x: number; y: number };
    paddle1: { y: number; score: number; height: number };
    paddle2: { y: number; score: number; height: number };
    width: number;
    height: number;
    powerUp: { x: number; y: number; type: 'SPEED' | 'SIZE'; active: boolean } | null;
}

export function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ws = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<string>('Connecting...');
    const [gameStarted, setGameStarted] = useState(false);
    const [modeSelected, setModeSelected] = useState(false);

    const sendMove = (direction: 'up' | 'down') => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'MOVE', direction }));
        }
    };

    const joinGame = (mode: 'ONLINE' | 'BOT') => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            setModeSelected(true);
            const userId = Math.floor(Math.random() * 10000);
            if (mode === 'BOT') {
                setStatus('Starting Bot Game...');
                ws.current.send(JSON.stringify({ type: 'INIT', userId, mode: 'BOT' }));
            } else {
                setStatus('Searching for opponent...');
                ws.current.send(JSON.stringify({ type: 'INIT', userId }));
            }
        }
    };

    useEffect(() => {
        // Connect to WebSocket
        ws.current = new WebSocket('ws://localhost:3000/ws');

        ws.current.onopen = () => {
            setStatus('Connected. Select Game Mode:');
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'START') {
                setGameStarted(true);
                setStatus(`Game Started! You are Player ${data.player}`);
            } else if (data.type === 'UPDATE') {
                draw(data.state);
            } else if (data.type === 'GAME_OVER') {
                setStatus(`Game Over! Winner: Player ${data.winner}`);
                setTimeout(() => {
                    setGameStarted(false);
                    setModeSelected(false);
                    setStatus('Game Over. Select Game Mode:');
                }, 3000);
            } else if (data.type === 'WAITING') {
                setStatus('Waiting for opponent...');
            }
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

            if (e.key === 'ArrowUp') {
                e.preventDefault(); // Prevent scrolling
                sendMove('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault(); // Prevent scrolling
                sendMove('down');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const draw = (state: GameState) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Ball
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(state.ball.x, state.ball.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw Paddles
        ctx.fillStyle = '#fff';
        ctx.fillRect(10, state.paddle1.y, 10, state.paddle1.height || 100); // Paddle 1
        ctx.fillRect(state.width - 20, state.paddle2.y, 10, state.paddle2.height || 100); // Paddle 2

        // Draw PowerUp
        if (state.powerUp && state.powerUp.active) {
            ctx.fillStyle = state.powerUp.type === 'SPEED' ? 'red' : 'green';
            ctx.beginPath();
            ctx.arc(state.powerUp.x, state.powerUp.y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText(state.powerUp.type[0], state.powerUp.x - 4, state.powerUp.y + 4);
        }

        // Draw Scores
        ctx.font = '30px Arial';
        ctx.fillText(state.paddle1.score.toString(), state.width / 4, 50);
        ctx.fillText(state.paddle2.score.toString(), (state.width / 4) * 3, 50);

        // Draw Center Line
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(state.width / 2, 0);
        ctx.lineTo(state.width / 2, state.height);
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] w-full items-center justify-center p-2 overflow-hidden">
            <h2 className="text-xl mb-2 text-center text-white">{status}</h2>

            {!modeSelected && (
                <div className="mb-4 flex gap-4 z-10">
                    <button
                        onClick={() => joinGame('ONLINE')}
                        className="px-6 py-2 bg-indigo-600 rounded-lg text-white font-bold hover:bg-indigo-700 transition"
                    >
                        Play Online
                    </button>
                    <button
                        onClick={() => joinGame('BOT')}
                        className="px-6 py-2 bg-green-600 rounded-lg text-white font-bold hover:bg-green-700 transition"
                    >
                        Play vs Bot
                    </button>
                </div>
            )}

            <div className="flex-1 w-full relative min-h-0 flex items-center justify-center bg-gray-900 border-2 border-gray-700 rounded-lg">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            <div className="mt-4 flex gap-8">
                <button
                    className="w-20 h-20 rounded-full bg-blue-600/50 border-2 border-white/30 text-3xl flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all touch-manipulation backdrop-blur-sm"
                    onTouchStart={(e) => { e.preventDefault(); sendMove('up'); }}
                    onClick={() => sendMove('up')}
                >
                    ↑
                </button>
                <button
                    className="w-20 h-20 rounded-full bg-blue-600/50 border-2 border-white/30 text-3xl flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all touch-manipulation backdrop-blur-sm"
                    onTouchStart={(e) => { e.preventDefault(); sendMove('down'); }}
                    onClick={() => sendMove('down')}
                >
                    ↓
                </button>
            </div>

            <p className="mt-2 text-gray-500 text-xs">
                Use Arrow Keys or Buttons
            </p>
        </div>
    );
}
