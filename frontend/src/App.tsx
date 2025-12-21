import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Game } from './pages/Game';

function Home() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <h1 className="text-5xl font-bold mb-8">ft_transcendence</h1>
            <p className="text-xl mb-8">{t('welcome')}</p>
            <Link
                to="/game"
                className="px-6 py-3 bg-blue-600 rounded-lg text-xl hover:bg-blue-700 transition"
            >
                Play Pong
            </Link>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-900 text-white">
                <nav className="p-4 bg-gray-800 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold">Pong</Link>
                    <div className="space-x-4">
                        <Link to="/" className="hover:text-blue-400">Home</Link>
                        <Link to="/game" className="hover:text-blue-400">Game</Link>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game" element={<Game />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
