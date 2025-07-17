import { chatMessages, messageInput, sendButton, menuButton, sidebar, sidebarNewChat, loginButton, chatList as chatListUI, introScreen, suggestionsContainer, overlay, addMessageToUI, showMessageMenu } from './ui.js';
import { history, chatList, loadHistory, loadChatList, createNewChat, deleteChat, updateCurrentChatTitle } from './history.js';
import { sendMessage, regenerateResponse } from './chat.js';
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
        btn.className = 'bg-black text-gray-100 px-4 py-2 rounded-full shadow hover:bg-gray-700 transition w-full max-w-xs';
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

function renderChatList() {
    chatListUI.innerHTML = '';
    for (const chat of chatList) {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between bg-gray-800 px-3 py-2 rounded';
        const openBtn = document.createElement('button');
        openBtn.className = 'flex-1 text-left';
        openBtn.textContent = chat.title;
        openBtn.addEventListener('click', async () => {
            chatMessages.innerHTML = '';
            await loadHistory(chat.id);
            for (let i = 0; i < history.length; i++) {
                const msg = history[i];
                if (msg.role === 'system') continue;
                const sender = msg.role === 'assistant' ? 'bot' : 'user';
                const bubble = addMessageToUI(msg.content, sender);
                bubble.dataset.message = msg.content;
                if (sender === 'bot') {
                    bubble.dataset.userMessage = history[i - 1]?.content || '';
                }
                bubble.addEventListener('click', (e) => showMessageMenu(e, sender, bubble));
            }
            hideIntro();
            sidebar.classList.add('translate-x-full');
            overlay.classList.add('hidden');
        });
        const delBtn = document.createElement('button');
        delBtn.textContent = '🗑';
        delBtn.className = 'ml-2 text-red-500';
        delBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await deleteChat(chat.id);
            renderChatList();
        });
        li.appendChild(openBtn);
        li.appendChild(delBtn);
        chatListUI.appendChild(li);
    }
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

menuButton.addEventListener('click', () => {
    const isOpen = !sidebar.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden', !isOpen);
});

overlay.addEventListener('click', () => {
    sidebar.classList.add('translate-x-full');
    overlay.classList.add('hidden');
});

sidebarNewChat.addEventListener('click', async () => {
    await createNewChat();
    chatMessages.innerHTML = '';
    renderChatList();
    showIntro();
    sidebar.classList.add('translate-x-full');
    overlay.classList.add('hidden');
});

loginButton.addEventListener('click', async () => {
    await puter.auth.login();
    updateLoginState();
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadChatList();
    if (chatList.length === 0) {
        await createNewChat();
    }
    await loadHistory(chatList[0].id);
    renderChatList();
    if (history.length > 1) {
        hideIntro();
        for (let i = 0; i < history.length; i++) {
            const msg = history[i];
            if (msg.role === 'system') continue;
            const sender = msg.role === 'assistant' ? 'bot' : 'user';
            const bubble = addMessageToUI(msg.content, sender);
            bubble.dataset.message = msg.content;
            if (sender === 'bot') {
                bubble.dataset.userMessage = history[i - 1]?.content || '';
            }
            bubble.addEventListener('click', (e) => showMessageMenu(e, sender, bubble));
        }
    } else {
        showIntro();
    }
    updateLoginState();
    window.regenerate = regenerateResponse;
});
