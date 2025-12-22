import WebSocket from 'ws';

const WS_URL = 'ws://127.0.0.1:3000/ws';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testControls() {
    console.log('Starting Control Test...');

    const client1 = new WebSocket(WS_URL);
    const client2 = new WebSocket(WS_URL);

    const p1State: any[] = [];

    try {
        await new Promise<void>(resolve => client1.on('open', resolve));
        await new Promise<void>(resolve => client2.on('open', resolve));
        console.log('Clients connected');

        // Capture updates
        client1.on('message', (data: any) => {
            const msg = JSON.parse(data.toString());
            if (msg.type === 'UPDATE') {
                p1State.push(msg.state);
            }
        });

        // Start Game
        console.log('Initializing Game...');
        client1.send(JSON.stringify({ type: 'INIT', userId: 101 }));
        await sleep(100);
        client2.send(JSON.stringify({ type: 'INIT', userId: 102 }));

        await sleep(1000); // Wait for game start

        // Check initial state
        if (p1State.length === 0) {
            throw new Error('No game state received. Game failed to start.');
        }
        const initialState = p1State[p1State.length - 1];
        console.log('Initial Paddle1 Y:', initialState.paddle1.y);

        // Send Move Up
        console.log('Sending MOVE UP...');
        client1.send(JSON.stringify({ type: 'MOVE', direction: 'up' }));
        client1.send(JSON.stringify({ type: 'MOVE', direction: 'up' }));
        client1.send(JSON.stringify({ type: 'MOVE', direction: 'up' }));

        await sleep(500);

        const finalState = p1State[p1State.length - 1];
        console.log('Final Paddle1 Y:', finalState.paddle1.y);
        console.log('Final Paddle2 Y:', finalState.paddle2.y);

        if (finalState.paddle1.y !== initialState.paddle1.y || finalState.paddle2.y !== initialState.paddle2.y) {
            console.log('SUCCESS: Paddle moved!');
            process.exit(0);
        } else {
            console.error('FAILURE: Paddle did not move.');
            console.error('Initial P1:', initialState.paddle1.y, 'Final P1:', finalState.paddle1.y);
            console.error('Initial P2:', initialState.paddle2.y, 'Final P2:', finalState.paddle2.y);
            process.exit(1);
        }

    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    } finally {
        client1.close();
        client2.close();
    }
}

testControls();
