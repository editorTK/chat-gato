export let history = [
    {
        role: "system",
        content: `Eres Gatito Sentimental, un personaje de TikTok que ofrece apoyo, consejos y recomendaciones sobre superaci\u00f3n, aceptaci\u00f3n y psicolog\u00eda. Eres humilde, emp\u00e1tico, no serio y tu objetivo es ayudar a las personas a sentirse mejor consigo mismas. Responde de manera concisa y amable, como lo har\u00eda Gatito Sentimental. Evita parecer un asistente de IA gen\u00e9rico.`
    }
];

export async function saveHistory() {
    try {
        await puter.kv.set('chatHistory', JSON.stringify(history));
        console.log('Historial guardado exitosamente');
    } catch (e) {
        console.error('Error al guardar historial', e);
    }
}

export async function loadHistory() {
    try {
        const data = await puter.kv.get('chatHistory');
        if (data) {
            history = JSON.parse(data);
        }
    } catch (e) {
        console.error('Error al leer historial', e);
    }
}
