import { chatMessages, messageInput, sendButton, introScreen } from './ui.js';
import { history, saveHistory } from './history.js';
import { addMessageToUI } from './ui.js';

export async function sendMessage() {
    const userMessage = messageInput.value.trim();
    if (userMessage === '') return;

    introScreen.classList.add('hidden');
    chatMessages.classList.remove('hidden');

    addMessageToUI(userMessage, 'user');
    messageInput.value = '';

    history.push({ role: 'user', content: userMessage });
    await saveHistory();

    messageInput.disabled = true;
    sendButton.disabled = true;
    sendButton.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>`;

    try {
        const stream = await puter.ai.chat(history, {
            model: 'gpt-4o',
            stream: true,
            temperature: 0.7
        });

        let botMessageDiv;
        let assistantReply = '';

        for await (const part of stream) {
            if (part?.text) {
                if (!botMessageDiv) {
                    const messageContainer = document.createElement('div');
                    messageContainer.classList.add('flex', 'mb-2', 'justify-start');
                    botMessageDiv = document.createElement('div');
                    botMessageDiv.classList.add('bot-message', 'text-gray-100', 'p-3', 'rounded-lg', 'max-w-[80%]', 'break-words', 'shadow');
                    messageContainer.appendChild(botMessageDiv);
                    chatMessages.appendChild(messageContainer);
                }

                assistantReply += part.text;
                botMessageDiv.innerHTML = assistantReply.replaceAll('\n', '<br>');
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }

        history.push({ role: 'assistant', content: assistantReply });
        await saveHistory();

    } catch (error) {
        console.error('Error al llamar a la IA:', error);
        addMessageToUI('Lo siento, hubo un error al obtener la respuesta. Por favor, inténtalo de nuevo más tarde.', 'bot');
    } finally {
        messageInput.disabled = false;
        sendButton.disabled = false;
        sendButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>`;
        messageInput.focus();
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    }
}
