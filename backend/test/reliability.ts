import WebSocket from 'ws';

console.log('Simulating flaky connections...');

// Connection 1: Connects and drops immediately
console.log('1. Ghost player connecting...');
const ws1 = new WebSocket('ws://localhost:3000/ws');
ws1.on('open', () => {
    ws1.send(JSON.stringify({ type: 'INIT', userId: 999 }));
    console.log('1. Ghost player in queue. Disconnecting...');
    ws1.close();
});

// Delay, then try to match 2 real players
setTimeout(() => {
    console.log('2. Real players connecting...');
    const ws2 = new WebSocket('ws://localhost:3000/ws');
    const ws3 = new WebSocket('ws://localhost:3000/ws');

    let p2Start = false;
    let p3Start = false;

    ws2.on('open', () => ws2.send(JSON.stringify({ type: 'INIT', userId: 10 })));
    ws3.on('open', () => ws3.send(JSON.stringify({ type: 'INIT', userId: 11 })));

    ws2.on('message', (d) => { if (JSON.parse(d.toString()).type === 'START') p2Start = true; });
    ws3.on('message', (d) => { if (JSON.parse(d.toString()).type === 'START') p3Start = true; });

    setTimeout(() => {
        if (p2Start && p3Start) {
            console.log('✅ Real players matched successfully despite ghost!');
            process.exit(0);
        } else {
            console.error('❌ Real players failed to match. Stuck with ghost?');
            process.exit(1);
        }
    }, 2000);

}, 1000);
