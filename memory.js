let dbPromise;
export let userMemory = {};
let memoryEntries = [];

function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open('userMemoryDB', 1);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore('entries', { keyPath: 'id' });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    return dbPromise;
}

function txDone(tx) {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

export async function loadMemory() {
    const db = await openDB();
    const tx = db.transaction('entries', 'readonly');
    const store = tx.objectStore('entries');
    const req = store.getAll();
    const entries = await new Promise((res, rej) => {
        req.onsuccess = () => res(req.result || []);
        req.onerror = () => rej(req.error);
    });
    memoryEntries = entries;
    rebuildUserMemory();
    await txDone(tx);
}

function rebuildUserMemory() {
    userMemory = {};
    for (const entry of memoryEntries) {
        userMemory[entry.key] = entry.value;
    }
}

export function getMemoryEntries() {
    return memoryEntries.slice();
}

async function addEntry(key, value, source) {
    const db = await openDB();
    const entry = { id: Date.now() + Math.random(), key, value, source, timestamp: Date.now() };
    const tx = db.transaction('entries', 'readwrite');
    const store = tx.objectStore('entries');
    store.put(entry);
    await txDone(tx);
    memoryEntries.push(entry);
    userMemory[key] = value;
}

export async function deleteMemoryEntry(id) {
    const db = await openDB();
    const tx = db.transaction('entries', 'readwrite');
    const store = tx.objectStore('entries');
    store.delete(id);
    await txDone(tx);
    memoryEntries = memoryEntries.filter(e => e.id !== id);
    rebuildUserMemory();
}

export async function updateMemoryFromJson(obj, source) {
    let updated = false;
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (userMemory[key] !== value) {
            await addEntry(key, value, source);
            updated = true;
        }
    }
    return updated;
}
