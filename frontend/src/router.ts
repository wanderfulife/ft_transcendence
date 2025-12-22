export class Router {
    private routes: Record<string, () => void> = {};

    constructor() {
        window.addEventListener('popstate', () => this.handleRoute());
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.matches('[data-link]')) {
                e.preventDefault();
                this.navigate(target.getAttribute('href')!);
            }
        });
    }

    add(path: string, handler: () => void) {
        this.routes[path] = handler;
    }

    navigate(path: string) {
        history.pushState(null, '', path);
        this.handleRoute();
    }

    handleRoute() {
        const path = window.location.pathname;
        const handler = this.routes[path] || this.routes['/'];
        handler();
    }
}
