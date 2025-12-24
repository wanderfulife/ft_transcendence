
interface GameState {
    ball: { x: number; y: number };
    paddle1: { y: number; score: number; height: number };
    paddle2: { y: number; score: number; height: number };
    width: number;
    height: number;
    powerUp: { x: number; y: number; type: 'SPEED' | 'SIZE'; active: boolean } | null;
}

let ws: WebSocket | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let container: HTMLElement | null = null;
let statusElement: HTMLElement | null = null;

export function initGame(parent: HTMLElement) {
    container = parent;

    // HTML Structure
    container.innerHTML = `
        <div class="flex flex-col h-[calc(100vh-100px)] w-full items-center justify-center p-2 overflow-hidden text-white">
            <h2 id="status" class="text-xl mb-2 text-center text-white">Connecting...</h2>
            
            <div id="mode-selection" class="mb-4 flex gap-4 z-10 hidden">
                <button id="btn-online" class="px-6 py-2 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700 transition">Play Online</button>
                <button id="btn-bot" class="px-6 py-2 bg-green-600 rounded-lg font-bold hover:bg-green-700 transition">Play vs Bot</button>
            </div>

            <div class="flex-1 w-full relative min-h-0 flex items-center justify-center bg-gray-900 border-2 border-gray-700 rounded-lg">
                <canvas id="gameCanvas" width="800" height="600" class="max-w-full max-h-full object-contain"></canvas>
            </div>

            <div class="mt-4 flex gap-8">
                <button id="btn-up" class="w-20 h-20 rounded-full bg-blue-600/50 border-2 border-white/30 text-3xl flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all touch-manipulation backdrop-blur-sm">↑</button>
                <button id="btn-down" class="w-20 h-20 rounded-full bg-blue-600/50 border-2 border-white/30 text-3xl flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all touch-manipulation backdrop-blur-sm">↓</button>
            </div>
            
            <p class="mt-2 text-gray-500 text-xs">Use Arrow Keys or Buttons</p>
        </div>
    `;

    canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    ctx = canvas.getContext('2d');
    statusElement = document.getElementById('status');

    setupControls();
    connectWebSocket();
}

function setupControls() {
    const btnUp = document.getElementById('btn-up')!;
    const btnDown = document.getElementById('btn-down')!;

    let moveInterval: any = null;
    let currentDir: 'up' | 'down' | null = null;

    const startMove = (dir: 'up' | 'down') => {
        if (currentDir === dir) return; // Already moving this way
        currentDir = dir;

        if (moveInterval) clearInterval(moveInterval);

        // Send immediately
        sendMove(dir);
        // Then loop
        moveInterval = setInterval(() => {
            sendMove(dir);
        }, 16); // ~60fps
    };

    const stopMove = (dir: 'up' | 'down') => {
        if (currentDir === dir) {
            currentDir = null;
            if (moveInterval) {
                clearInterval(moveInterval);
                moveInterval = null;
            }
        }
    };

    const sendMove = (dir: 'up' | 'down') => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'MOVE', direction: dir }));
        }
    };

    // Touch/Mouse Events for Buttons
    const setupBtn = (btn: HTMLElement, dir: 'up' | 'down') => {
        btn.addEventListener('mousedown', (e) => { e.preventDefault(); startMove(dir); });
        btn.addEventListener('mouseup', (e) => { e.preventDefault(); stopMove(dir); });
        btn.addEventListener('mouseleave', (e) => { e.preventDefault(); stopMove(dir); });

        btn.addEventListener('touchstart', (e) => { e.preventDefault(); startMove(dir); });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); stopMove(dir); });
    };

    setupBtn(btnUp, 'up');
    setupBtn(btnDown, 'down');

    // Keyboard Events
    document.addEventListener('keydown', (e) => {
        if (e.repeat) return; // Ignore auto-repeat, we handle it
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { startMove('up'); }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { startMove('down'); }
        if (e.key === ' ') { e.preventDefault(); startMove('up'); } // Map space to up just in case
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { stopMove('up'); }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { stopMove('down'); }
        if (e.key === ' ') { stopMove('up'); }
    });

    document.getElementById('btn-online')!.onclick = () => joinGame('ONLINE');
    document.getElementById('btn-bot')!.onclick = () => joinGame('BOT');
}

function joinGame(mode: 'ONLINE' | 'BOT') {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const userId = Math.floor(Math.random() * 10000);
    document.getElementById('mode-selection')!.classList.add('hidden');

    if (mode === 'BOT') {
        updateStatus('Starting Bot Game...');
        ws.send(JSON.stringify({ type: 'INIT', userId, mode: 'BOT' }));
    } else {
        updateStatus('Searching for opponent...');
        ws.send(JSON.stringify({ type: 'INIT', userId }));
    }
}

function connectWebSocket() {
    ws = new WebSocket('wss://localhost:3000/ws');

    ws.onopen = () => {
        updateStatus('Connected. Select Game Mode:');
        document.getElementById('mode-selection')!.classList.remove('hidden');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'START') {
            updateStatus(`Game Started! You are Player ${data.player}`);
        } else if (data.type === 'UPDATE') {
            draw(data.state);
        } else if (data.type === 'GAME_OVER') {
            updateStatus(`Game Over! Winner: Player ${data.winner}`);
            setTimeout(() => {
                updateStatus('Game Over. Select Game Mode:');
                document.getElementById('mode-selection')!.classList.remove('hidden');
            }, 3000);
        } else if (data.type === 'WAITING') {
            updateStatus('Waiting for opponent...');
        }
    };

    ws.onclose = () => {
        updateStatus('Disconnected. Reconnecting...');
        setTimeout(connectWebSocket, 3000);
    };
}

function updateStatus(text: string) {
    if (statusElement) statusElement.textContent = text;
}

function draw(state: GameState) {
    if (!canvas || !ctx) return;

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
    ctx.fillRect(10, state.paddle1.y, 10, state.paddle1.height || 100);
    ctx.fillRect(state.width - 20, state.paddle2.y, 10, state.paddle2.height || 100);

    // Draw PowerUp
    if (state.powerUp && state.powerUp.active) {
        ctx.fillStyle = state.powerUp.type === 'SPEED' ? 'red' : 'green';
        ctx.beginPath();
        ctx.arc(state.powerUp.x, state.powerUp.y, 15, 0, Math.PI * 2);
        ctx.fill();
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
}
