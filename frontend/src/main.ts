import './styles/index.css';
import { Router } from './router';
// We will import pages here later

const app = document.getElementById('app')!;

const router = new Router();

// Define pages
// Define pages
router.add('/', () => {
    // Check for token in URL (OAuth Callback)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
        localStorage.setItem('token', token);
        window.history.replaceState({}, document.title, '/'); // Clean URL
    }

    const savedToken = localStorage.getItem('token');
    const isLoggedIn = !!savedToken;

    app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[50vh] text-white space-y-8">
            <h1 class="text-5xl font-bold">ft_transcendence</h1>
            <p class="text-xl">Welcome to the Vanilla Pong!</p>
            
            ${isLoggedIn ? `
                <div class="bg-gray-800 p-6 rounded-lg text-center">
                    <p class="text-green-400 mb-4">✅ Logged In</p>
                    <a href="/game" data-link class="block w-full px-6 py-3 bg-blue-600 rounded-lg text-xl hover:bg-blue-700 transition mb-4">Play Pong</a>
                    
                    <div class="border-t border-gray-700 pt-4 mt-4">
                        <h3 class="mb-2 font-bold">Avatar</h3>
                        <input type="file" id="avatar-input" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 mb-2"/>
                        <button id="btn-upload" class="px-4 py-2 bg-gray-600 rounded text-sm hover:bg-gray-500">Upload New Avatar</button>
                        <div id="upload-status" class="mt-2 text-xs"></div>
                    </div>
                </div>
            ` : `
                <div class="flex flex-col gap-4">
                     <a href="https://localhost:3000/api/auth/42" class="px-6 py-3 bg-black border border-white rounded-lg text-xl hover:bg-gray-900 transition flex items-center gap-2">
                        <span>🚀</span> Login with 42
                     </a>
                     <p class="text-xs text-center text-gray-500">Redirects to 42 Intra</p>
                </div>
            `}
        </div>
    `;

    if (isLoggedIn) {
        document.getElementById('btn-upload')?.addEventListener('click', async () => {
            const input = document.getElementById('avatar-input') as HTMLInputElement;
            const file = input.files?.[0];
            if (!file) {
                alert('Select a file first');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('https://localhost:3000/api/users/avatar', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${savedToken}` },
                    body: formData
                });
                const data = await res.json();
                if (res.ok) {
                    document.getElementById('upload-status')!.textContent = 'Upload Success: ' + data.url;
                    document.getElementById('upload-status')!.className = 'mt-2 text-xs text-green-400';
                } else {
                    document.getElementById('upload-status')!.textContent = 'Error: ' + data.error;
                    document.getElementById('upload-status')!.className = 'mt-2 text-xs text-red-400';
                }
            } catch (e) {
                console.error(e);
                alert('Upload failed');
            }
        });
    }
});

router.add('/game', () => {
    app.innerHTML = '<div id="game-container"></div>';
    import('./pages/Game').then(module => {
        module.initGame(document.getElementById('game-container')!);
    });
});

router.handleRoute();
