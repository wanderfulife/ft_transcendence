import './styles/index.css';
import { Router } from './router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const app = document.getElementById('app')!;

const router = new Router();

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
        <div class="flex flex-col items-center justify-center min-h-screen w-full text-white space-y-8 p-4">
            
            ${isLoggedIn ? `
                <div class="glass-card p-10 w-full max-w-md flex flex-col items-center gap-6 animate-enter" style="animation-delay: 0.2s">
                    <div class="flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-1.5 rounded-full text-sm font-medium border border-green-500/30">
                        <span class="relative flex h-2 w-2">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Logged In
                    </div>
                    
                    <a href="/game" data-link class="group relative w-full flex justify-center py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 active:scale-[0.98]">
                        Play Pong
                    </a>
                    
                    <div class="w-full border-t border-gray-700/50 pt-6 mt-2 flex flex-col items-center gap-4">
                        <div class="flex flex-col items-center gap-1">
                             <h3 class="font-bold text-lg text-gray-200">Player Profile</h3>
                             <p class="text-xs text-gray-400">Customize your avatar below</p>
                        </div>
                        
                    <label class="group relative w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-4 border-white/10 shadow-2xl transition hover:scale-105 hover:border-violet-500/50 cursor-pointer">
                        <img id="avatar-preview" src="https://ui-avatars.com/api/?name=User&background=0f172a&color=fff" alt="Avatar" class="w-full h-full object-cover transition duration-300">
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span class="text-xs font-bold">Change</span>
                        </div>
                        <input type="file" id="avatar-input" class="hidden" accept="image/*" />
                    </label>

                    <div id="upload-status" class="text-xs h-4 font-medium transition-all"></div>
                    
                    <div class="w-full pt-2 flex flex-col items-center gap-4">
                         <button id="btn-logout" class="text-red-400/80 hover:text-red-300 text-sm hover:underline font-medium transition-colors">Sign Out</button>
                    </div>
                </div>
            ` : `
                <div class="glass-card p-8 w-full max-w-sm flex flex-col gap-4 animate-enter" style="animation-delay: 0.2s">
                    <a href="/login" data-link class="block w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-center font-bold text-white shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5">
                        Login
                    </a>
                    <a href="/register" data-link class="block w-full py-3.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-center font-bold text-white border border-slate-600 transition-all hover:shadow-lg">
                        Create Account
                    </a>
                    
                    <div class="relative flex py-3 items-center">
                        <div class="flex-grow border-t border-gray-600/50"></div>
                        <span class="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-widest font-semibold">Or continue with</span>
                        <div class="flex-grow border-t border-gray-600/50"></div>
                    </div>
                    
                     <a href="https://localhost:3000/api/auth/42" class="group w-full py-3.5 bg-black hover:bg-black/80 border border-gray-700 rounded-xl text-center transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl">
                        <span class="text-xl group-hover:scale-110 transition-transform">🚀</span> 
                        <span class="font-bold text-gray-100">42 Intra</span>
                     </a>
                </div>
            `}
        </div>
        <!-- Background Orbs -->
        <div class="fixed top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-[128px] pointer-events-none mix-blend-screen animate-pulse"></div>
        <div class="fixed bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen animate-pulse" style="animation-delay: 2s"></div>
    `;

    if (isLoggedIn) {
        // Fetch User Profile
        const fetchUserProfile = async () => {
            try {
                const res = await fetch('https://localhost:3000/api/users/me', {
                    headers: { 'Authorization': `Bearer ${savedToken}` }
                });
                if (res.ok) {
                    const user = await res.json();
                    const avatarImg = document.getElementById('avatar-preview') as HTMLImageElement;
                    if (avatarImg && user.avatar_url) {
                        avatarImg.src = user.avatar_url;
                    }
                }
            } catch (e) {
                console.error('Failed to fetch profile', e);
            }
        };

        fetchUserProfile();

        document.getElementById('btn-logout')?.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.reload();
        });

        // Auto-Upload on File Selection
        const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.addEventListener('change', async () => {
                const file = fileInput.files?.[0];
                if (!file) return;

                const statusDiv = document.getElementById('upload-status')!;
                statusDiv.textContent = 'Uploading...';
                statusDiv.className = 'text-xs h-4 font-medium text-blue-400 animate-pulse';

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
                        statusDiv.textContent = 'Updated!';
                        statusDiv.className = 'text-xs h-4 font-medium text-green-400';

                        // Update Avatar Preview
                        const avatarImg = document.getElementById('avatar-preview') as HTMLImageElement;
                        if (avatarImg) {
                            avatarImg.src = data.url;
                        }

                        // Clear status after 2s
                        setTimeout(() => {
                            if (statusDiv) statusDiv.textContent = '';
                        }, 2000);
                    } else {
                        statusDiv.textContent = 'Error: ' + data.error;
                        statusDiv.className = 'text-xs h-4 font-medium text-red-400';
                    }
                } catch (e) {
                    console.error(e);
                    statusDiv.textContent = 'Upload Failed';
                    statusDiv.className = 'text-xs h-4 font-medium text-red-400';
                }
            });
        }
    }
});

router.add('/login', () => Login(app));
router.add('/register', () => Register(app));

router.add('/game', () => {
    app.innerHTML = '<div id="game-container"></div>';
    import('./pages/Game').then(module => {
        module.initGame(document.getElementById('game-container')!);
    });
});

router.handleRoute();
