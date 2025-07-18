import { chatMessages, messageInput, sendButton, introScreen, showMessageMenu, addMessageToUI } from './ui.js';
import { history, saveHistory, updateCurrentChatTitle, chatList } from './history.js';

export async function sendMessage(forcedText) {
    const userMessage = (forcedText !== undefined ? forcedText : messageInput.value).trim();
    if (userMessage === '') return;

    introScreen.classList.add('hidden');
    chatMessages.classList.remove('hidden');

    const userBubble = addMessageToUI(userMessage, 'user');
    userBubble.dataset.message = userMessage;
    userBubble.addEventListener('click', (e) => showMessageMenu(e, 'user', userBubble));
    if (forcedText === undefined) {
        messageInput.value = '';
    }

    history.push({ role: 'user', content: userMessage });
    await saveHistory();
    if (chatList.length > 0 && chatList[0].title === 'Nuevo chat') {
        updateCurrentChatTitle(userMessage.substring(0, 30));
    }

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
        let textContainer;
        let assistantReply = '';

        for await (const part of stream) {
            if (part?.text) {
                if (!botMessageDiv) {
                    const messageContainer = document.createElement('div');
                    messageContainer.classList.add('flex', 'mb-2', 'justify-start');
                    botMessageDiv = document.createElement('div');
                    botMessageDiv.classList.add('bot-message', 'text-gray-100', 'p-3', 'rounded-lg', 'max-w-[80%]', 'break-words', 'shadow', 'relative', 'pl-10');
                    botMessageDiv.dataset.userMessage = userMessage;
                    const img = document.createElement('img');
                    img.src = 'foto_perfil.png';
                    img.alt = 'perfil';
                    img.className = 'w-8 h-8 rounded-full absolute';
                    img.style.left = '-6px';
                    img.style.top = '-6px';
                    botMessageDiv.appendChild(img);
                    textContainer = document.createElement('div');
                    botMessageDiv.appendChild(textContainer);
                    messageContainer.appendChild(botMessageDiv);
                    chatMessages.appendChild(messageContainer);
                    botMessageDiv.addEventListener('click', (e) => showMessageMenu(e, 'bot', botMessageDiv));
                }

                assistantReply += part.text;
                botMessageDiv.dataset.message = assistantReply;
                textContainer.innerHTML = assistantReply.replaceAll('\n', '<br>');
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

export async function regenerateResponse(userMsg, assistantText, bubble) {
    const container = bubble.parentElement;
    const userContainer = container.previousElementSibling;
    if (userContainer && userContainer.querySelector('.user-message')) {
        userContainer.remove();
    }
    container.remove();

    for (let i = history.length - 1; i >= 1; i--) {
        if (history[i].role === 'assistant' && history[i].content === assistantText &&
            history[i - 1]?.role === 'user' && history[i - 1].content === userMsg) {
            history.splice(i - 1, 2);
            break;
        }
    }
    await saveHistory();

    await sendMessage(userMsg);
}
