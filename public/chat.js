document.addEventListener('DOMContentLoaded', () => {
    const widget = document.getElementById('chat-widget');
    const toggle = document.getElementById('chat-toggle');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const resetBtn = document.getElementById('chat-reset');
    const messagesDiv = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    if (!widget) return;

    const productName = widget.dataset.product || 'default';
    const storageKey = `chat_history_${productName}`;

    const welcomeMsg = `Hi! Ask me about the "${productName}" — I can pull up reviews or answer any questions.`;

    // Load history from localStorage
    let messages = [];
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) messages = JSON.parse(saved);
    } catch {}

    // Render saved messages or welcome
    if (messages.length === 0) {
        addMessage('assistant', welcomeMsg);
    } else {
        messages.forEach(m => addMessage(m.role, m.content));
    }

    function saveHistory() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } catch {}
    }

    function clearHistory() {
        messages = [];
        localStorage.removeItem(storageKey);
        messagesDiv.innerHTML = '';
        addMessage('assistant', welcomeMsg);
    }

    // Toggle panel
    toggle.addEventListener('click', () => {
        const isOpen = panel.style.display === 'flex';
        panel.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) input.focus();
    });

    closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
    resetBtn.addEventListener('click', clearHistory);

    let sending = false;
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !sending) send(); });

    async function send() {
        const text = input.value.trim();
        if (!text || sending) return;

        input.value = '';
        sending = true;
        sendBtn.disabled = true;

        addMessage('user', text);
        messages.push({ role: 'user', content: text });
        saveHistory();

        const thinking = addMessage('assistant', '...');

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            });
            const data = await res.json();
            const reply = data.reply || data.error || 'No response.';
            thinking.textContent = reply;
            messages.push({ role: 'assistant', content: reply });
            saveHistory();
        } catch {
            thinking.textContent = '[Connection error]';
        }

        sending = false;
        sendBtn.disabled = false;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        input.focus();
    }

    function addMessage(role, text) {
        const div = document.createElement('div');
        div.className = `chat-msg chat-msg-${role}`;
        div.textContent = text;
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        return div;
    }
});
