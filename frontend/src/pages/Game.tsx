import { GameCanvas } from '../components/GameCanvas';

export function Game() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Pong Arena</h1>
            <GameCanvas />
        </div>
    );
}
