/**
 * Destruction Mode Module
 * * To use this module:
 * 1. Make sure your HTML includes the necessary elements:
 * - A button with an ID (e.g., id="activate-destruction-btn")
 * - <canvas id="glass-pane"></canvas>
 * - <div id="shard-container"></div>
 * - <div id="exit-destruction-tip">...</div>
 * - The SVG for the axe with id="axe"
 * 2. Import the initialize function in your main script:
 * import { initializeDestructionMode } from './path/to/this/file.js';
 * 3. Call the function after the DOM is loaded, passing the button's ID:
 * initializeDestructionMode('activate-destruction-btn');
 */

export function initializeDestructionMode(buttonId) {
    const destructionBtn = document.getElementById(buttonId);
    if (!destructionBtn) {
        console.error(`Destruction mode button with id "${buttonId}" not found!`);
        return;
    }

    const canvas = document.getElementById('glass-pane');
    const ctx = canvas.getContext('2d');
    const axe = document.getElementById('axe');
    const shardContainer = document.getElementById('shard-container');
    const exitDestructionTip = document.getElementById('exit-destruction-tip');
    
    let audioContext;
    let isAudioInitialized = false;

    function activateDestructionMode() {
        document.body.classList.add('destruction-active');
        exitDestructionTip.classList.add('visible');
        setTimeout(() => {
            exitDestructionTip.classList.remove('visible');
        }, 3000);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.addEventListener('mousemove', moveAxe);
        window.addEventListener('mousedown', handleSmash, true);
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('keydown', handleDestructionKeys);
    }

    function deactivateDestructionMode() {
        document.body.classList.remove('destruction-active');
        exitDestructionTip.classList.remove('visible');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear cracks
        window.removeEventListener('mousemove', moveAxe);
        window.removeEventListener('mousedown', handleSmash, true);
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('keydown', handleDestructionKeys);
    }

    function handleDestructionKeys(e) {
        if (e.key === "Escape") {
            deactivateDestructionMode();
        }
    }
    
    function moveAxe(e) {
        axe.style.left = `${e.clientX}px`;
        axe.style.top = `${e.clientY}px`;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    function playDestructionSound() {
        if (!audioContext) return;
        const now = audioContext.currentTime;

        const thudOsc = audioContext.createOscillator();
        const thudGain = audioContext.createGain();
        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(100, now);
        thudOsc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
        thudGain.gain.setValueAtTime(2.0, now);
        thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        thudOsc.connect(thudGain).connect(audioContext.destination);
        thudOsc.start(now);
        thudOsc.stop(now + 0.2);

        const noiseSource = audioContext.createBufferSource();
        const noiseBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 0.5, audioContext.sampleRate);
        for (let c = 0; c < 2; c++) {
            const output = noiseBuffer.getChannelData(c);
            for (let i = 0; i < noiseBuffer.length; i++) {
                output[i] = (Math.random() * 2 - 1);
            }
        }
        noiseSource.buffer = noiseBuffer;
        const lowpass = audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 7500;
        const highpass = audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 600;
        const shatterGain = audioContext.createGain();
        shatterGain.gain.setValueAtTime(1.5, now);
        shatterGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        noiseSource.connect(highpass).connect(lowpass).connect(shatterGain).connect(audioContext.destination);
        noiseSource.start(now);
        
        const rumbleSource = audioContext.createBufferSource();
        rumbleSource.buffer = noiseBuffer;
        const rumbleLowpass = audioContext.createBiquadFilter();
        rumbleLowpass.type = 'lowpass';
        rumbleLowpass.frequency.value = 250;
        const rumbleGain = audioContext.createGain();
        rumbleGain.gain.setValueAtTime(1.0, now + 0.05);
        rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        rumbleSource.connect(rumbleLowpass).connect(rumbleGain).connect(audioContext.destination);
        rumbleSource.start(now + 0.05);
    }

    function drawShatter(x, y) {
        const numCracks = 10 + Math.floor(Math.random() * 8);
        for (let i = 0; i < numCracks; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const length = 50 + Math.random() * 150;
            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(226, 232, 240, ${0.2 + Math.random() * 0.3})`;
            ctx.lineWidth = 0.5 + Math.random() * 2;
            ctx.stroke();
        }
    }

    function createFallingShards(x, y) {
        const numShards = 15 + Math.floor(Math.random() * 10);
        for (let i = 0; i < numShards; i++) {
            const shard = document.createElement('div');
            shard.className = 'shard';
            const size = 5 + Math.random() * 20;
            const halfSize = size / 2;
            shard.style.left = `${x - halfSize}px`;
            shard.style.top = `${y - halfSize}px`;
            shard.style.borderWidth = `${halfSize}px`;
            shard.style.borderColor = `transparent transparent rgba(200, 210, 220, ${0.3 + Math.random() * 0.4}) transparent`;
            const horizSpeed = (Math.random() - 0.5) * 300;
            shard.style.animationDuration = `${1 + Math.random()}s`;
            shard.style.transform = `translateX(${horizSpeed}px)`;
            shardContainer.appendChild(shard);
            setTimeout(() => { shard.remove(); }, 2000);
        }
    }

    function handleSmash(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!isAudioInitialized) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            isAudioInitialized = true;
        }
        axe.classList.remove('swing');
        void axe.offsetWidth;
        axe.classList.add('swing');
        playDestructionSound();
        drawShatter(e.clientX, e.clientY);
        createFallingShards(e.clientX, e.clientY);
    }

    destructionBtn.addEventListener('click', activateDestructionMode);
}
