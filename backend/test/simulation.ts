import WebSocket from 'ws';

console.log('Simulating 2 players connecting...');

const ws1 = new WebSocket('ws://localhost:3000/ws');
const ws2 = new WebSocket('ws://localhost:3000/ws');

let p1Connected = false;
let p2Connected = false;

ws1.on('open', () => {
    console.log('Player 1 connected');
    ws1.send(JSON.stringify({ type: 'INIT', userId: 1 }));
});

ws1.on('message', (data) => {
    const msg = JSON.parse(data.toString()); // WebSocket message is a Buffer/String
    if (msg.type === 'WAITING') console.log('Player 1 waiting...');
    if (msg.type === 'START') {
        console.log('Player 1 Game Started!');
        p1Connected = true;
        checkDone();
    }
});

ws2.on('open', () => {
    console.log('Player 2 connected');
    ws2.send(JSON.stringify({ type: 'INIT', userId: 2 }));
});

ws2.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'START') {
        console.log('Player 2 Game Started!');
        p2Connected = true;
        checkDone();
    }
});

function checkDone() {
    if (p1Connected && p2Connected) {
        console.log('✅ Matchmaking works!');
        process.exit(0);
    }
}

// Timeout
setTimeout(() => {
    console.error('❌ Timeout: Match didn\'t start in 5 seconds');
    process.exit(1);
}, 5000);
