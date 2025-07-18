export const chatMessages = document.getElementById('chat-messages');
export const messageInput = document.getElementById('message-input');
export const sendButton = document.getElementById('send-button');
export const menuButton = document.getElementById('menu-button');
export const sidebar = document.getElementById('sidebar');
export const sidebarNewChat = document.getElementById('sidebar-new-chat');
export const customizationButton = document.getElementById('customization-button');
export const customizationModal = document.getElementById('customization-modal');
export const customNameInput = document.getElementById('custom-name');
export const customTraitsInput = document.getElementById('custom-traits');
export const customExtraInput = document.getElementById('custom-extra');
export const customSaveButton = document.getElementById('custom-save');
export const customCancelButton = document.getElementById('custom-cancel');
export const chatList = document.getElementById('chat-list');
export const introScreen = document.getElementById('intro-screen');
export const suggestionsContainer = document.getElementById('suggestions');
export const overlay = document.getElementById('overlay');

let openMenuBubble = null;

export function addMessageToUI(text, sender = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'mb-2');

    const bubble = document.createElement('div');
    bubble.classList.add('text-gray-100', 'p-3', 'rounded-lg', 'max-w-[80%]', 'break-words', 'shadow', 'relative');

    if (sender === 'user') {
        messageDiv.classList.add('justify-end');
        bubble.classList.add('user-message');
        bubble.innerHTML = marked.parse(text);
    } else {
        messageDiv.classList.add('justify-start');
        bubble.classList.add('bot-message', 'pl-10');
        const img = document.createElement('img');
        img.src = 'foto_perfil.png';
        img.alt = 'perfil';
        img.className = 'w-8 h-8 rounded-full absolute';
        img.style.left = '-6px';
        img.style.top = '-6px';
        bubble.appendChild(img);
        const content = document.createElement('div');
        content.innerHTML = marked.parse(text);
        bubble.appendChild(content);
    }

    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return bubble;
}

export function showMessageMenu(event, sender, bubble) {
    event.preventDefault();
    event.stopPropagation();

    const existing = document.getElementById('message-menu');
    if (existing) {
        existing.remove();
        overlay.classList.add('hidden');
        if (openMenuBubble === bubble) {
            openMenuBubble = null;
            return;
        }
    }

    openMenuBubble = bubble;

    const menu = document.createElement('div');
    menu.id = 'message-menu';
    menu.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-700 text-white rounded shadow-lg p-4 text-sm space-y-2 z-30';
    overlay.classList.remove('hidden');

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copiar';
    copyBtn.className = 'block w-full text-left hover:bg-gray-600 px-2 py-1';
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(bubble.dataset.message || bubble.textContent);
        menu.remove();
    });
    menu.appendChild(copyBtn);

    if (sender === 'bot') {
        const regenBtn = document.createElement('button');
        regenBtn.textContent = 'Regenerar respuesta';
        regenBtn.className = 'block w-full text-left hover:bg-gray-600 px-2 py-1';
        regenBtn.addEventListener('click', () => {
            menu.remove();
            if (window.regenerate) {
                window.regenerate(bubble.dataset.userMessage, bubble.dataset.message, bubble);
            }
        });
        menu.appendChild(regenBtn);
    } else {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar mensaje';
        editBtn.className = 'block w-full text-left hover:bg-gray-600 px-2 py-1';
        editBtn.addEventListener('click', () => {
            messageInput.value = bubble.dataset.message;
            messageInput.focus();
            menu.remove();
        });
        menu.appendChild(editBtn);
    }

    document.body.appendChild(menu);

    const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            overlay.classList.add('hidden');
            openMenuBubble = null;
            document.removeEventListener('click', closeMenu);
        }
    };
    setTimeout(() => document.addEventListener('click', closeMenu));
}
