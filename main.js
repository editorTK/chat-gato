import { chatMessages, messageInput, sendButton, menuButton, sidebar, sidebarNewChat, customizationButton, customizationModal, customNameInput, customTraitsInput, customExtraInput, customSaveButton, customCancelButton, chatList as chatListUI, introScreen, suggestionsContainer, overlay, addMessageToUI, showMessageMenu, showOverlay, hideOverlay, memoryButton, memoryModal, memoryList, memoryCloseButton } from './ui.js';
import { history, chatList, loadHistory, loadChatList, createNewChat, deleteChat, updateCurrentChatTitle, loadCustomization, saveCustomization, personalization, refreshSystemMessage } from './history.js';
import { loadMemory, getMemoryEntries, deleteMemoryEntry } from './memory.js';
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
        btn.className = 'bg-gray-700 text-gray-100 px-4 py-2 rounded-full shadow-lg hover:bg-gray-600 transition w-full max-w-xs';
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
        li.className = 'flex items-center justify-between bg-[#121212] px-3 py-2 rounded';
        const openBtn = document.createElement('button');
        openBtn.className = 'flex-1 text-left text-[#FAFAFA]';
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
            hideOverlay();
        });
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6"/><path d="M10 10v6M14 10v6"/><path d="M9 6V4h6v2"/></svg>';
        delBtn.className = 'ml-2';
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

function renderMemoryList() {
    memoryList.innerHTML = '';
    const entries = getMemoryEntries();
    if (entries.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No hay datos guardados.';
        memoryList.appendChild(li);
        return;
    }
    for (const entry of entries) {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-start bg-gray-700 rounded p-2';
        const info = document.createElement('div');
        info.innerHTML = `<strong>${entry.key}:</strong> ${entry.value}<br><span class="text-xs text-gray-400">${new Date(entry.timestamp).toLocaleString()}</span><br><span class="text-xs text-gray-400">Fuente: ${entry.source}</span>`;
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.className = 'text-red-400 text-xs ml-2';
        delBtn.addEventListener('click', async () => {
            await deleteMemoryEntry(entry.id);
            renderMemoryList();
            refreshSystemMessage();
        });
        li.appendChild(info);
        li.appendChild(delBtn);
        memoryList.appendChild(li);
    }
}

sendButton.addEventListener('click', sendMessage);

function resizeInput() {
    const max = 200;
    messageInput.style.height = 'auto';
    const newHeight = Math.min(messageInput.scrollHeight, max);
    messageInput.style.height = newHeight + 'px';
    messageInput.style.overflowY = messageInput.scrollHeight > max ? 'auto' : 'hidden';
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

menuButton.addEventListener('click', () => {
    const isOpen = !sidebar.classList.toggle('translate-x-full');
    if (isOpen) {
        showOverlay();
    } else {
        hideOverlay();
    }
});

overlay.addEventListener('click', () => {
    sidebar.classList.add('translate-x-full');
    const menu = document.getElementById('message-menu');
    if (menu) menu.remove();
    customizationModal.classList.add('hidden');
    memoryModal.classList.add('hidden');
    hideOverlay();
});

sidebarNewChat.addEventListener('click', async () => {
    await createNewChat();
    chatMessages.innerHTML = '';
    renderChatList();
    showIntro();
    sidebar.classList.add('translate-x-full');
    hideOverlay();
});

customizationButton.addEventListener('click', async () => {
    await loadCustomization();
    customNameInput.value = personalization.name || '';
    customTraitsInput.value = personalization.traits || '';
    customExtraInput.value = personalization.extra || '';
    customizationModal.classList.remove('hidden');
    sidebar.classList.add('translate-x-full');
    showOverlay();
});

customCancelButton.addEventListener('click', () => {
    customizationModal.classList.add('hidden');
    hideOverlay();
});

customSaveButton.addEventListener('click', async () => {
    await saveCustomization({
        name: customNameInput.value.trim(),
        traits: customTraitsInput.value.trim(),
        extra: customExtraInput.value.trim()
    });
    customizationModal.classList.add('hidden');
    hideOverlay();
});

memoryButton.addEventListener('click', () => {
    renderMemoryList();
    memoryModal.classList.remove('hidden');
    sidebar.classList.add('translate-x-full');
    showOverlay();
});

memoryCloseButton.addEventListener('click', () => {
    memoryModal.classList.add('hidden');
    hideOverlay();
});

document.addEventListener('DOMContentLoaded', async () => {
    await updateLoginState();
    await loadCustomization();
    await loadMemory();
    refreshSystemMessage();
    await loadChatList();
    if (chatList.length > 0) {
        await loadHistory(chatList[0].id);
    } else {
        await createNewChat();
    }
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
    window.regenerate = regenerateResponse;
});
