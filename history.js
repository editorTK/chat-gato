export let history = [];
export let chatList = [];
export let currentChatId = null;

export let personalization = { name: '', features: '', extra: '' };

const baseSystemPrompt = `Eres Gatito Sentimental, un personaje de TikTok que ofrece apoyo, consejos y recomendaciones sobre superación, aceptación y psicología. Eres humilde, empático, no serio y tu objetivo es ayudar a las personas a sentirse mejor consigo mismas. Responde de manera concisa y amable, como lo haría Gatito Sentimental. Evita parecer un asistente de IA genérico.`;

export function getSystemMessage() {
    let content = baseSystemPrompt;
    if (personalization.features) {
        content += ' ' + personalization.features;
    }
    if (personalization.name) {
        content += ` Llama al usuario "${personalization.name}".`;
    }
    if (personalization.extra) {
        content += ` Información adicional sobre el usuario: ${personalization.extra}`;
    }
    return { role: 'system', content };
}

export async function loadPersonalization() {
    try {
        const data = await puter.kv.get('personalization');
        if (data) personalization = JSON.parse(data);
    } catch (e) {
        console.error('Error al leer personalización', e);
    }
}

export async function savePersonalization() {
    try {
        await puter.kv.set('personalization', JSON.stringify(personalization));
    } catch (e) {
        console.error('Error al guardar personalización', e);
    }
}

export async function loadChatList() {
    try {
        const data = await puter.kv.get('chatList');
        if (data) chatList = JSON.parse(data);
    } catch (e) {
        console.error('Error al leer lista', e);
    }
}

export async function saveChatList() {
    try {
        await puter.kv.set('chatList', JSON.stringify(chatList));
    } catch (e) {
        console.error('Error al guardar lista', e);
    }
}

export async function createNewChat() {
    const id = Date.now().toString();
    currentChatId = id;
    history = [getSystemMessage()];
    chatList.unshift({ id, title: 'Nuevo chat' });
    await saveChatList();
    await saveHistory();
    return id;
}

export async function deleteChat(id) {
    try {
        await puter.kv.del(`chatHistory-${id}`);
        chatList = chatList.filter(c => c.id !== id);
        await saveChatList();
        if (currentChatId === id) {
            await createNewChat();
        }
    } catch (e) {
        console.error('Error al borrar chat', e);
    }
}

export async function saveHistory() {
    if (!currentChatId) return;
    try {
        await puter.kv.set(`chatHistory-${currentChatId}`, JSON.stringify(history));
    } catch (e) {
        console.error('Error al guardar historial', e);
    }
}

export async function loadHistory(id) {
    currentChatId = id;
    try {
        const data = await puter.kv.get(`chatHistory-${id}`);
        if (data) {
            history = JSON.parse(data);
            history[0] = getSystemMessage();
        } else {
            history = [getSystemMessage()];
        }
    } catch (e) {
        console.error('Error al leer historial', e);
        history = [getSystemMessage()];
    }
}

export function updateCurrentChatTitle(title) {
    const chat = chatList.find(c => c.id === currentChatId);
    if (chat) {
        chat.title = title;
        saveChatList();
    }
}
