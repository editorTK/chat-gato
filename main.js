import { chatMessages, messageInput, sendButton, newChatButton, loginButton, introScreen, suggestionsContainer, addMessageToUI } from './ui.js';
import { history, loadHistory } from './history.js';
import { sendMessage } from './chat.js';
import { updateLoginState } from './auth.js';

const suggestions = [
    'Explica la ansiedad',
    'Cómo manejar el estrés',
    'Consejos para dormir mejor',
    'Ideas para mejorar mi autoestima',
    'Formas de motivarme cada día',
    'Técnicas de respiración',
    '¿Qué hacer cuando me siento triste?',
    'Cómo organizar mi tiempo',
    'Recomendaciones para leer sobre psicología',
    'Ejercicios para la concentración',
    'Maneras de cultivar la gratitud',
    'Hábitos saludables para la mente',
    'Cómo iniciar la meditación',
    'Trucos para mantenerme enfocado',
    'Cómo superar el miedo al fracaso'
];

function populateSuggestions() {
    suggestionsContainer.innerHTML = '';
    const shuffled = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const text of shuffled) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = 'bg-gray-700 text-gray-100 px-4 py-2 rounded-full hover:bg-gray-600 transition';
        btn.addEventListener('click', () => {
            messageInput.value = text;
            hideIntro();
            sendMessage();
        });
        suggestionsContainer.appendChild(btn);
    }
}

function showIntro() {
    introScreen.classList.remove('hidden');
    chatMessages.classList.add('hidden');
    populateSuggestions();
}

function hideIntro() {
    introScreen.classList.add('hidden');
    chatMessages.classList.remove('hidden');
}

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
    showIntro();
});

loginButton.addEventListener('click', async () => {
    await puter.auth.login();
    updateLoginState();
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadHistory();
    if (history.length > 1) {
        hideIntro();
        for (const msg of history) {
            if (msg.role === 'user') addMessageToUI(msg.content, 'user');
            if (msg.role === 'assistant') addMessageToUI(msg.content, 'bot');
        }
    } else {
        showIntro();
    }
    updateLoginState();
});
