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

    useEffect(() => {
        // Connect to WebSocket
        ws.current = new WebSocket('ws://localhost:3000/ws');

        ws.current.onopen = () => {
            setStatus('Connected. Waiting for opponent...');
            // Send INIT message with random ID for now (or from auth context)
            const userId = Math.floor(Math.random() * 10000);
            ws.current?.send(JSON.stringify({ type: 'INIT', userId }));
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'START') {
                setStatus(`Game Started! You are Player ${data.player}`);
            } else if (data.type === 'UPDATE') {
                draw(data.state);
            } else if (data.type === 'GAME_OVER') {
                setStatus(`Game Over! Winner: Player ${data.winner}`);
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
                ws.current.send(JSON.stringify({ type: 'MOVE', direction: 'up' }));
            } else if (e.key === 'ArrowDown') {
                ws.current.send(JSON.stringify({ type: 'MOVE', direction: 'down' }));
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
        <div className="flex flex-col items-center">
            <h2 className="text-2xl mb-4">{status}</h2>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border-4 border-white bg-black"
            />
            <p className="mt-4">Use Arrow Up/Down to move.</p>
        </div>
    );
}
