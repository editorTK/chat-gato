export let history = [];
export let chatList = [];
export let currentChatId = null;
export let personalization = { name: '', traits: '', extra: '' };
import { userMemory } from './memory.js';
let systemMessage = buildSystemMessage();

function buildSystemMessage() {
    let content = `Eres Gatito Sentimental, un personaje de TikTok que ofrece apoyo, consejos y recomendaciones sobre superación, aceptación y psicología. Eres humilde, empático, no serio y tu objetivo es ayudar a las personas a sentirse mejor consigo mismas. Responde de manera concisa y amable, como lo haría Gatito Sentimental. Evita parecer un asistente de IA genérico.`;
    if (personalization.name) {
        content += ` El usuario prefiere que lo llames "${personalization.name}".`;
    }
    if (personalization.traits) {
        content += ` Gatito Sentimental debe tener estas características: ${personalization.traits}.`;
    }
    if (personalization.extra) {
        content += ` Información adicional sobre el usuario: ${personalization.extra}.`;
    }
    if (userMemory.name) {
        content += ` El nombre del usuario es ${userMemory.name}.`;
    }
    if (userMemory.age) {
        content += ` Tiene ${userMemory.age} años.`;
    }
    if (userMemory.interests.length > 0) {
        content += ` Sus intereses incluyen: ${userMemory.interests.join(', ')}.`;
    }
    return { role: 'system', content };
}

export function refreshSystemMessage() {
    systemMessage = buildSystemMessage();
    if (history.length > 0) {
        history[0] = systemMessage;
    }
}

export async function loadCustomization() {
    try {
        const data = await puter.kv.get('customization');
        if (data) personalization = JSON.parse(data);
    } catch (e) {
        console.error('Error al leer personalización', e);
    }
    refreshSystemMessage();
}

export async function saveCustomization(data) {
    personalization = data;
    refreshSystemMessage();
    try {
        await puter.kv.set('customization', JSON.stringify(personalization));
        await saveHistory();
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
    refreshSystemMessage();
    history = [systemMessage];
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
        } else {
            systemMessage = buildSystemMessage();
            history = [systemMessage];
        }
    } catch (e) {
        console.error('Error al leer historial', e);
        systemMessage = buildSystemMessage();
        history = [systemMessage];
    }
    refreshSystemMessage();
}

export function updateCurrentChatTitle(title) {
    const chat = chatList.find(c => c.id === currentChatId);
    if (chat) {
        chat.title = title;
        saveChatList();
    }
}
