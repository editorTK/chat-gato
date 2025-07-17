export const chatMessages = document.getElementById('chat-messages');
export const messageInput = document.getElementById('message-input');
export const sendButton = document.getElementById('send-button');
export const menuButton = document.getElementById('menu-button');
export const sidebar = document.getElementById('sidebar');
export const sidebarNewChat = document.getElementById('sidebar-new-chat');
export const loginButton = document.getElementById('login-button');
export const chatList = document.getElementById('chat-list');
export const introScreen = document.getElementById('intro-screen');
export const suggestionsContainer = document.getElementById('suggestions');
export const overlay = document.getElementById('overlay');

export function addMessageToUI(text, sender = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'mb-2');

    if (sender === 'user') {
        messageDiv.classList.add('justify-end');
        messageDiv.innerHTML = `
            <div class="user-message text-gray-100 p-3 rounded-lg max-w-[80%] break-words shadow">
                ${text}
            </div>
        `;
    } else {
        messageDiv.classList.add('justify-start');
        messageDiv.innerHTML = `
            <div class="bot-message text-gray-100 p-3 rounded-lg max-w-[80%] break-words shadow">
                ${text}
            </div>
        `;
    }
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
