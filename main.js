import { chatMessages, messageInput, sendButton, sidebar, sidebarNewChat, loginButton, personalizeButton, personalizationModal, personalName, personalFeatures, personalExtra, personalSave, personalCancel, chatList as chatListUI, introScreen, suggestionsContainer, overlay, addMessageToUI, showMessageMenu } from './ui.js';
import { history, chatList, loadHistory, loadChatList, createNewChat, deleteChat, updateCurrentChatTitle, loadPersonalization, savePersonalization, personalization, getSystemMessage, saveHistory } from './history.js';
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

function resizeInput() {
    const maxHeight = 200;
    messageInput.style.height = 'auto';
    const newHeight = Math.min(messageInput.scrollHeight, maxHeight);
    messageInput.style.height = newHeight + 'px';
    messageInput.style.overflowY = messageInput.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        sendMessage();
    }
});

messageInput.addEventListener('input', resizeInput);
messageInput.addEventListener('paste', (e) => {
    e.stopPropagation();
    setTimeout(resizeInput);
});

resizeInput();

overlay.addEventListener('click', () => {
    const menu = document.getElementById('message-menu');
    if (menu) menu.remove();
    overlay.classList.add('hidden');
});

sidebarNewChat.addEventListener('click', async () => {
    await createNewChat();
    chatMessages.innerHTML = '';
    renderChatList();
    showIntro();
});

loginButton.addEventListener('click', async () => {
    await puter.auth.login();
    updateLoginState();
});

personalizeButton.addEventListener('click', () => {
    personalName.value = personalization.name || '';
    personalFeatures.value = personalization.features || '';
    personalExtra.value = personalization.extra || '';
    personalizationModal.classList.remove('hidden');
});

personalCancel.addEventListener('click', () => {
    personalizationModal.classList.add('hidden');
});

personalizationModal.addEventListener('click', (e) => {
    if (e.target === personalizationModal) {
        personalizationModal.classList.add('hidden');
    }
});

personalSave.addEventListener('click', async () => {
    personalization.name = personalName.value.trim();
    personalization.features = personalFeatures.value.trim();
    personalization.extra = personalExtra.value.trim();
    personalizationModal.classList.add('hidden');
    await savePersonalization();
    history[0] = getSystemMessage();
    await saveHistory();
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadPersonalization();
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
