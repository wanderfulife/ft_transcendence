import { PongGame, GameState } from '../src/game/pong';
import assert from 'assert';

console.log('running PongGame tests...');

let gameOverCalled = false;
let lastWinner = 0;

const onUpdate = (state: GameState) => { };
const onGameOver = (winner: number) => {
    gameOverCalled = true;
    lastWinner = winner;
};

const game = new PongGame(onUpdate, onGameOver);

// Test Initial State
assert.strictEqual(game.state.ball.x, 400, 'Initial ball x should be 400');
assert.strictEqual(game.state.ball.y, 300, 'Initial ball y should be 300');
assert.strictEqual(game.state.paddle1.score, 0, 'Initial score should be 0');

console.log('✅ Initial state verified');

// Test Ball Movement
const initialX = game.state.ball.x;
game.update();
assert.notStrictEqual(game.state.ball.x, initialX, 'Ball should move');

console.log('✅ Ball movement verified');

// Test Paddle Movement
game.movePaddle(1, 'up');
assert.strictEqual(game.state.paddle1.y, 230, 'Paddle 1 should move up'); // 250 - 20 = 230

game.movePaddle(2, 'down');
assert.strictEqual(game.state.paddle2.y, 270, 'Paddle 2 should move down'); // 250 + 20 = 270

console.log('✅ Paddle movement verified');

// Test Scoring (Force ball to edge)
game.state.ball.x = -10;
game.update();
assert.strictEqual(game.state.paddle2.score, 1, 'Player 2 should score when ball is < 0');

console.log('✅ Scoring verified');

// Test Win Condition
game.state.paddle1.score = 5;
game.checkWin();
assert.strictEqual(gameOverCalled, true, 'Game should be over');
assert.strictEqual(lastWinner, 1, 'Player 1 should win');

console.log('✅ Win condition verified');
console.log('🎉 All tests passed!');
