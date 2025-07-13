import { chatMessages, messageInput, sendButton, newChatButton, loginButton, addMessageToUI } from './ui.js';
import { history, loadHistory } from './history.js';
import { sendMessage } from './chat.js';
import { updateLoginState } from './auth.js';

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
});

messageInput.style.height = messageInput.scrollHeight + 'px';

newChatButton.addEventListener('click', async () => {
    const systemOnly = history.filter(m => m.role === 'system');
    history.length = 0;
    history.push(...systemOnly);
    chatMessages.innerHTML = '';
    await puter.kv.del('chatHistory');
});

loginButton.addEventListener('click', async () => {
    await puter.auth.login();
    updateLoginState();
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadHistory();
    for (const msg of history) {
        if (msg.role === 'user') addMessageToUI(msg.content, 'user');
        if (msg.role === 'assistant') addMessageToUI(msg.content, 'bot');
    }
    updateLoginState();
});
