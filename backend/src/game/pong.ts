export interface GameState {
    ball: { x: number; y: number; dx: number; dy: number };
    paddle1: { y: number; score: number; height: number };
    paddle2: { y: number; score: number; height: number };
    width: number;
    height: number;
    powerUp: { x: number; y: number; type: 'SPEED' | 'SIZE'; active: boolean } | null;
}

export class PongGame {
    state: GameState;
    intervalId: NodeJS.Timeout | null = null;
    onUpdate: (state: GameState) => void;
    onGameOver: (winner: number) => void;
    isBot: boolean;

    constructor(onUpdate: (state: GameState) => void, onGameOver: (winner: number) => void, isBot: boolean = false) {
        this.onUpdate = onUpdate;
        this.onGameOver = onGameOver;
        this.isBot = isBot;
        this.state = {
            ball: { x: 400, y: 300, dx: 5, dy: 5 },
            paddle1: { y: 250, score: 0, height: 100 },
            paddle2: { y: 250, score: 0, height: 100 },
            width: 800,
            height: 600,
            powerUp: null
        };
    }

    start() {
        this.intervalId = setInterval(() => {
            this.update();
            this.onUpdate(this.state);
        }, 1000 / 60); // 60 FPS

        // Spawn powerup every 10 seconds
        setInterval(() => {
            if (!this.state.powerUp) {
                this.state.powerUp = {
                    x: Math.random() * 600 + 100,
                    y: Math.random() * 400 + 100,
                    type: Math.random() > 0.5 ? 'SPEED' : 'SIZE',
                    active: true
                };
            }
        }, 10000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    update() {
        // AI Movement
        if (this.isBot) {
            const paddleCenter = this.state.paddle2.y + this.state.paddle2.height / 2;
            const targetY = this.state.ball.y;
            const diff = targetY - paddleCenter;
            const speed = 22; // Increased to match new game speed

            if (Math.abs(diff) > 10) {
                if (diff > 0) this.movePaddle(2, 'down');
                else this.movePaddle(2, 'up');
            }
        }

        // Move ball
        this.state.ball.x += this.state.ball.dx;
        this.state.ball.y += this.state.ball.dy;

        // Bounce off top/bottom
        if (this.state.ball.y <= 0 || this.state.ball.y >= this.state.height) {
            this.state.ball.dy *= -1;
        }

        // Paddle collision
        // Paddle 1
        if (this.state.ball.x <= 20 && this.state.ball.y >= this.state.paddle1.y && this.state.ball.y <= this.state.paddle1.y + this.state.paddle1.height) {
            this.state.ball.dx *= -1;
            this.checkPowerUpCollision(1);
        }
        // Paddle 2
        if (this.state.ball.x >= this.state.width - 20 && this.state.ball.y >= this.state.paddle2.y && this.state.ball.y <= this.state.paddle2.y + this.state.paddle2.height) {
            this.state.ball.dx *= -1;
            this.checkPowerUpCollision(2);
        }

        // PowerUp Collision with Ball (Simplified: if ball hits powerup area)
        if (this.state.powerUp && this.state.powerUp.active) {
            const dx = this.state.ball.x - this.state.powerUp.x;
            const dy = this.state.ball.y - this.state.powerUp.y;
            if (Math.sqrt(dx * dx + dy * dy) < 30) {
                // Apply effect to the last player who hit the ball? 
                // Or maybe just random effect on ball?
                // Let's say if ball hits it, it speeds up the ball
                this.state.ball.dx *= 1.5;
                this.state.ball.dy *= 1.5;
                this.state.powerUp.active = false;
                this.state.powerUp = null;
            }
        }

        // Scoring
        if (this.state.ball.x < 0) {
            this.state.paddle2.score++;
            this.resetBall();
            this.checkWin();
        } else if (this.state.ball.x > this.state.width) {
            this.state.paddle1.score++;
            this.resetBall();
            this.checkWin();
        }
    }

    checkPowerUpCollision(player: number) {
        // Logic for paddle hitting powerup if we wanted that
    }

    resetBall() {
        this.state.ball = { x: 400, y: 300, dx: 5 * (Math.random() > 0.5 ? 1 : -1), dy: 5 * (Math.random() > 0.5 ? 1 : -1) };
        // Reset paddle heights
        this.state.paddle1.height = 100;
        this.state.paddle2.height = 100;
    }

    checkWin() {
        if (this.state.paddle1.score >= 5) {
            this.stop();
            this.onGameOver(1);
        } else if (this.state.paddle2.score >= 5) {
            this.stop();
            this.onGameOver(2);
        }
    }

    movePaddle(player: 1 | 2, direction: 'up' | 'down') {
        const speed = 40;
        const paddle = player === 1 ? this.state.paddle1 : this.state.paddle2;

        if (direction === 'up') paddle.y = Math.max(0, paddle.y - speed);
        else paddle.y = Math.min(this.state.height - paddle.height, paddle.y + speed);
    }
}
