document.addEventListener('DOMContentLoaded', () => {
    // ซ่อน loading screen เมื่อหน้าโหลดเสร็จ
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 3000); // หน่วง 3 วินาทีเพื่อให้เห็น animation

    // เอฟเฟกต์กระพริบของ static overlay
    const staticOverlay = document.querySelector('.static-overlay');
    setInterval(() => {
        staticOverlay.style.opacity = Math.random() * 0.3 + 0.1;
    }, 500);

    // ข้อความหลอนที่ปรากฏ/หายไปแบบสุ่ม
    const creepyMessages = [
        'Nobody’s here...',
        'Why are you still here?',
        'Something’s watching you...',
        'The shop never closes...'
    ];
    setInterval(() => {
        const randomMessage = creepyMessages[Math.floor(Math.random() * creepyMessages.length)];
        const p = document.createElement('p');
        p.textContent = randomMessage;
        p.style.position = 'fixed';
        p.style.color = '#FF0000';
        p.style.fontFamily = 'Courier New';
        p.style.top = `${Math.random() * 80}%`;
        p.style.left = `${Math.random() * 80}%`;
        p.style.opacity = '0.7';
        document.body.appendChild(p);
        setTimeout(() => {
            p.remove();
        }, 2000);
    }, 5000);
});