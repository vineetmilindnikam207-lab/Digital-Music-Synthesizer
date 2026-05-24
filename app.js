// 1. Initialize the Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 2. Get references to our HTML interface elements
const volumeControl = document.getElementById('volume');
const waveformControl = document.getElementById('waveform');

// Filter UI References
const filterTypeControl = document.getElementById('filterType');
const filterFreqControl = document.getElementById('filterFreq');
const filterQControl = document.getElementById('filterQ');
const freqValueDisplay = document.getElementById('freqValue');
const qValueDisplay = document.getElementById('qValue');

// Delay UI References
const delayTimeControl = document.getElementById('delayTime');
const delayFeedbackControl = document.getElementById('delayFeedback');
const delayTimeDisplay = document.getElementById('delayTimeValue');
const feedbackDisplay = document.getElementById('feedbackValue');

// Safe checks to update value labels on screen when sliders move
if(filterFreqControl) { filterFreqControl.addEventListener('input', () => { freqValueDisplay.textContent = `${filterFreqControl.value} Hz`; }); }
if(filterQControl) { filterQControl.addEventListener('input', () => { qValueDisplay.textContent = filterQControl.value; }); }
if(delayTimeControl) { delayTimeControl.addEventListener('input', () => { delayTimeDisplay.textContent = `${parseFloat(delayTimeControl.value).toFixed(2)} s`; }); }
if(delayFeedbackControl) { delayFeedbackControl.addEventListener('input', () => { feedbackDisplay.textContent = parseFloat(delayFeedbackControl.value).toFixed(2); }); }

// 3. Map our virtual piano notes to frequencies
const noteFrequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
};

// --- NEW/RESTORED KEY BINDINGS MAP ---
// Maps your computer keyboard keys to the corresponding musical notes
const keyToNoteMap = {
    'a': 'C4',  'w': 'C#4',
    's': 'D4',  'e': 'D#4',
    'd': 'E4',
    'f': 'F4',  't': 'F#4',
    'g': 'G4',  'y': 'G#4',
    'h': 'A4',  'u': 'A#4',
    'j': 'B4',
    'k': 'C5'
};

// 4. Core Function to play notes through the entire Week 5 audio chain
function playNote(frequency) {
    if (!frequency) return;

    // Create fresh nodes for this note instance
    const oscillator = audioCtx.createOscillator();
    const filterNode = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain(); // Main Volume
    const delayNode = audioCtx.createDelay(1.0); 
    const feedbackGain = audioCtx.createGain();

    // Configure Oscillator
    oscillator.type = waveformControl.value; 
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); 

    // Configure Filter (Fallback values included in case inputs render slow)
    filterNode.type = filterTypeControl ? filterTypeControl.value : 'lowpass'; 
    filterNode.frequency.setValueAtTime(filterFreqControl ? parseFloat(filterFreqControl.value) : 20000, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(filterQControl ? parseFloat(filterQControl.value) : 1, audioCtx.currentTime);

    // Configure Main Volume / Gain Envelope
    const volumeValue = volumeControl ? parseFloat(volumeControl.value) : 0.5;
    const currentVolume = volumeValue * 0.5;
    gainNode.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

    // Configure Delay parameters dynamically from inputs
    const dTime = delayTimeControl ? parseFloat(delayTimeControl.value) : 0.3;
    const dFeedback = delayFeedbackControl ? parseFloat(delayFeedbackControl.value) : 0.4;
    delayNode.delayTime.setValueAtTime(dTime, audioCtx.currentTime);
    feedbackGain.gain.setValueAtTime(dFeedback, audioCtx.currentTime);

    // --- AUDIO ROUTING CHAIN ---
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination); // Direct Clean Sound
    
    gainNode.connect(delayNode);           // Send to Delay unit
    delayNode.connect(feedbackGain);       // Feedback loop step 1
    feedbackGain.connect(delayNode);       // Feedback loop step 2
    delayNode.connect(audioCtx.destination); // Send Echoes to Speakers
    
    // Trigger playback
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.2);
}

// 5. Click event listeners for visual mouse clicks
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (event) => {
        event.stopPropagation();
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }

        const noteName = key.getAttribute('data-note');
        const frequency = noteFrequencies[noteName];
        playNote(frequency);
    });
});

// --- RESTORED LAPTOP KEYBOARD LISTENERS ---
window.addEventListener('keydown', (event) => {
    // Avoid triggering notes if typing inside a control selection dropdown
    if (event.target.tagName === 'SELECT') return;

    const keyPressed = event.key.toLowerCase();
    if (keyToNoteMap[keyPressed]) {
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }
        
        const noteName = keyToNoteMap[keyPressed];
        const frequency = noteFrequencies[noteName];
        
        // Visual indicator feedback: highlight the active key on screen
        const visualKey = document.querySelector(`.key[data-note="${noteName}"]`);
        if (visualKey) { visualKey.style.opacity = '0.7'; }
        
        playNote(frequency);
    }
});

window.addEventListener('keyup', (event) => {
    const keyReleased = event.key.toLowerCase();
    if (keyToNoteMap[keyReleased]) {
        const noteName = keyToNoteMap[keyReleased];
        const visualKey = document.querySelector(`.key[data-note="${noteName}"]`);
        if (visualKey) { visualKey.style.opacity = '1'; }
    }
});

window.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
});