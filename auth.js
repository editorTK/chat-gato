import { loginButton } from './ui.js';

export async function updateLoginState() {
    try {
        const possibleFn = puter?.auth?.user;
        const user = typeof possibleFn === 'function' ? await possibleFn() : possibleFn;
        if (user) {
            loginButton.style.display = 'none';
        } else {
            loginButton.style.display = 'block';
        }
    } catch {
        loginButton.style.display = 'block';
    }
}
