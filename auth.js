import { loginButton } from './ui.js';

export async function updateLoginState() {
    try {
        const user = await (puter.auth.user?.());
        if (user) {
            loginButton.style.display = 'none';
        } else {
            loginButton.style.display = 'block';
        }
    } catch {
        loginButton.style.display = 'block';
    }
}
