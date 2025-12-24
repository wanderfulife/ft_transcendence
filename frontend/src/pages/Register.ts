
export function Register(parent: HTMLElement) {
    parent.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen w-full text-white p-4">
            <div class="glass-card p-8 w-full max-w-md animate-enter">
                 <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">Create Account</h2>
                    <p class="text-gray-400 text-sm">Join the retro revolution</p>
                </div>

                <form id="register-form" class="flex flex-col gap-5">
                    <div class="space-y-1">
                         <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Username</label>
                        <input type="text" id="username" class="glass-input w-full rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50" placeholder="PlayerOne" required>
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Email</label>
                        <input type="email" id="email" class="glass-input w-full rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50" placeholder="name@example.com" required>
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Password</label>
                        <input type="password" id="password" class="glass-input w-full rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/50" placeholder="••••••••" required>
                    </div>
                    
                    <button type="submit" class="mt-2 w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-bold text-white shadow-lg shadow-emerald-900/40 transition-all transform hover:-translate-y-0.5">
                        Create Account
                    </button>
                    
                    <div id="error-msg" class="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-500/30 hidden animate-pulse"></div>
                    
                    <p class="text-sm text-center mt-4 text-gray-400">
                        Already have an account? <a href="/login" data-link class="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">Login</a>
                    </p>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('register-form');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        const errorMsg = document.getElementById('error-msg')!;

        try {
            const res = await fetch('https://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (res.ok) {
                window.location.href = '/login';
            } else {
                const data = await res.json();
                errorMsg.textContent = data.error || 'Registration failed';
                errorMsg.classList.remove('hidden');
            }
        } catch (err) {
            errorMsg.textContent = 'Network error';
            errorMsg.classList.remove('hidden');
        }
    });
}
