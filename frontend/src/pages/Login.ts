
export function Login(parent: HTMLElement) {
    parent.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen w-full text-white p-4">
            <div class="glass-card p-8 w-full max-w-md animate-enter">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400 mb-2">Welcome Back</h2>
                    <p class="text-gray-400 text-sm">Sign in to continue your journey</p>
                </div>
                
                <form id="login-form" class="flex flex-col gap-5">
                    <div class="space-y-1">
                        <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Email</label>
                        <input type="email" id="email" class="glass-input w-full rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50" placeholder="name@example.com" required>
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Password</label>
                        <input type="password" id="password" class="glass-input w-full rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50" placeholder="••••••••" required>
                    </div>
                    
                    <button type="submit" class="mt-2 w-full py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl font-bold text-white shadow-lg shadow-blue-900/40 transition-all transform hover:-translate-y-0.5">
                        Sign In
                    </button>
                    
                    <div id="error-msg" class="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-500/30 hidden animate-pulse"></div>
                    
                    <p class="text-sm text-center mt-4 text-gray-400">
                        Don't have an account? <a href="/register" data-link class="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">Register</a>
                    </p>
                </form>
            </div>
            <!-- Background Orbs -->
            <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]"></div>
                <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]"></div>
            </div>
        </div>
    `;

    const form = document.getElementById('login-form');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        const errorMsg = document.getElementById('error-msg')!;

        try {
            const res = await fetch('https://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                window.location.href = '/';
            } else {
                const data = await res.json();
                errorMsg.textContent = data.error || 'Login failed';
                errorMsg.classList.remove('hidden');
            }
        } catch (err) {
            errorMsg.textContent = 'Network error';
            errorMsg.classList.remove('hidden');
        }
    });
}
