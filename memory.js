export let userMemory = { name: '', age: '', interests: [] };

export async function loadMemory() {
    try {
        const data = await puter.kv.get('userMemory');
        if (data) userMemory = JSON.parse(data);
    } catch (e) {
        console.error('Error al cargar memoria', e);
    }
}

export async function saveMemory() {
    try {
        await puter.kv.set('userMemory', JSON.stringify(userMemory));
    } catch (e) {
        console.error('Error al guardar memoria', e);
    }
}

export function updateMemoryFromMessage(message) {
    let updated = false;
    const nameMatch = message.match(/(?:me llamo|mi nombre es|soy)\s+([\p{L}]+(?:\s+[\p{L}]+)?)/iu);
    if (nameMatch && !userMemory.name) {
        userMemory.name = nameMatch[1].trim();
        updated = true;
    }

    const ageMatch = message.match(/(\d{1,3})\s*a(?:ñ|n)os?/iu);
    if (ageMatch && !userMemory.age) {
        userMemory.age = ageMatch[1];
        updated = true;
    }

    const interestMatch = message.match(/(?:me interes(?:a|an)|me gusta(?:n)?|mis intereses son|estoy interesado en)\s+([^.!?]+)/i);
    if (interestMatch) {
        const interests = interestMatch[1]
            .split(/,| y /i)
            .map(s => s.trim())
            .filter(Boolean);
        for (const it of interests) {
            if (!userMemory.interests.includes(it)) {
                userMemory.interests.push(it);
                updated = true;
            }
        }
    }
    return updated;
}
