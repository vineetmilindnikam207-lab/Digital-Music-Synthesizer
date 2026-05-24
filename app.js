// 1. Initialize the Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 2. Get references to our HTML interface elements
const volumeControl = document.getElementById('volume');
const waveformControl = document.getElementById('waveform');
const filterTypeControl = document.getElementById('filterType');
const filterFreqControl = document.getElementById('filterFreq');
const filterQControl = document.getElementById('filterQ');
const delayTimeControl = document.getElementById('delayTime');
const delayFeedbackControl = document.getElementById('delayFeedback');

const freqValueDisplay = document.getElementById('freqValue');
const qValueDisplay = document.getElementById('qValue');
const delayTimeDisplay = document.getElementById('delayTimeValue');
const feedbackDisplay = document.getElementById('feedbackValue');

// Real-time UI input rendering updates
if(filterFreqControl) { filterFreqControl.addEventListener('input', () => { freqValueDisplay.textContent = `${filterFreqControl.value} Hz`; }); }
if(filterQControl) { filterQControl.addEventListener('input', () => { qValueDisplay.textContent = parseFloat(filterQControl.value).toFixed(1); }); }
if(delayTimeControl) { delayTimeControl.addEventListener('input', () => { delayTimeDisplay.textContent = `${parseFloat(delayTimeControl.value).toFixed(2)} s`; }); }
if(delayFeedbackControl) { delayFeedbackControl.addEventListener('input', () => { feedbackDisplay.textContent = parseFloat(delayFeedbackControl.value).toFixed(2); }); }

// 3. Map our virtual piano notes to frequencies
const noteFrequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
};

const keyToNoteMap = {
    'a': 'C4',  'w': 'C#4', 's': 'D4',  'e': 'D#4', 'd': 'E4',
    'f': 'F4',  't': 'F#4', 'g': 'G4',  'y': 'G#4', 'h': 'A4',  
    'u': 'A#4', 'j': 'B4',  'k': 'C5'
};

// 4. Core Function to play notes with integrated optimizations
function playNote(frequency) {
    if (!frequency || isNaN(frequency)) return; // Bug Fix: Guard against corrupt inputs

    const now = audioCtx.currentTime;

    // Create fresh nodes for this note instance
    const oscillator = audioCtx.createOscillator();
    const filterNode = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain(); 
    const delayNode = audioCtx.createDelay(1.0); 
    const feedbackGain = audioCtx.createGain();
    
    // Performance Optimization: Add a DynamicsCompressorNode to prevent digital audio clipping/distortion
    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-1.0, now);
    limiter.knee.setValueAtTime(0.0, now);
    limiter.ratio.setValueAtTime(20.0, now);
    limiter.attack.setValueAtTime(0.005, now);
    limiter.release.setValueAtTime(0.05, now);

    // Configure Oscillator safely
    oscillator.type = waveformControl ? waveformControl.value : 'sine'; 
    oscillator.frequency.setValueAtTime(frequency, now); 

    // Configure Filter with anti-pop parameter smoothing
    filterNode.type = filterTypeControl ? filterTypeControl.value : 'lowpass'; 
    const targetFreq = filterFreqControl ? parseFloat(filterFreqControl.value) : 20000;
    const targetQ = filterQControl ? parseFloat(filterQControl.value) : 1;
    // Using setTargetAtTime prevents sudden audio clicking pops when tweaking parameters mid-note
    filterNode.frequency.setTargetAtTime(targetFreq, now, 0.01);
    filterNode.Q.setTargetAtTime(targetQ, now, 0.01);

    // Configure Volume Envelope
    const volumeValue = volumeControl ? parseFloat(volumeControl.value) : 0.5;
    const currentVolume = Math.min(Math.max(volumeValue, 0), 1) * 0.5; // Bounds clamping optimization
    gainNode.gain.setValueAtTime(currentVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    // Configure Delay parameters safely
    const dTime = delayTimeControl ? parseFloat(delayTimeControl.value) : 0.3;
    const dFeedback = delayFeedbackControl ? parseFloat(delayFeedbackControl.value) : 0.4;
    delayNode.delayTime.setValueAtTime(Math.min(dTime, 1.0), now);
    feedbackGain.gain.setValueAtTime(Math.min(dFeedback, 0.9), now);

    // --- OPTIMIZED ROUTING CHAIN WITH ANTI-CLIPPING LIMITER ---
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    
    // Direct Signal to Limiter -> Output
    gainNode.connect(limiter);
    
    // Delay Feedback Loop
    gainNode.connect(delayNode);           
    delayNode.connect(feedbackGain);       
    feedbackGain.connect(delayNode);       
    
    // Delay Signal to Limiter -> Output
    delayNode.connect(limiter);
    
    // Final Safe output connection to speakers
    limiter.connect(audioCtx.destination); 
    
    // Trigger clean scheduled playback execution
    oscillator.start(now);
    oscillator.stop(now + 1.2);
}

// 5. Click event listeners for mouse tracking
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (event) => {
        event.stopPropagation();
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }
        const noteName = key.getAttribute('data-note');
        if(noteName) playNote(noteFrequencies[noteName]);
    });
});

// 6. Laptop Keyboard Event Listeners
window.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'SELECT' || event.repeat) return;
    const keyPressed = event.key.toLowerCase();
    if (keyToNoteMap[keyPressed]) {
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }
        const noteName = keyToNoteMap[keyPressed];
        const visualKey = document.querySelector(`.key[data-note="${noteName}"]`);
        if (visualKey) { visualKey.classList.add('active-pressed'); }
        playNote(noteFrequencies[noteName]);
    }
});

window.addEventListener('keyup', (event) => {
    const keyReleased = event.key.toLowerCase();
    if (keyToNoteMap[keyReleased]) {
        const noteName = keyToNoteMap[keyReleased];
        const visualKey = document.querySelector(`.key[data-note="${noteName}"]`);
        if (visualKey) { visualKey.classList.remove('active-pressed'); }
    }
});

window.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
});