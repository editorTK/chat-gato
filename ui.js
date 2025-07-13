export const chatMessages = document.getElementById('chat-messages');
export const messageInput = document.getElementById('message-input');
export const sendButton = document.getElementById('send-button');
export const newChatButton = document.getElementById('new-chat');
export const loginButton = document.getElementById('login-button');

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
