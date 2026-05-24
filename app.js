// 1. Initialize the Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 2. Get references to our HTML interface elements
const volumeControl = document.getElementById('volume');
const waveformControl = document.getElementById('waveform');

// Week 4 UI References
const filterTypeControl = document.getElementById('filterType');
const filterFreqControl = document.getElementById('filterFreq');
const filterQControl = document.getElementById('filterQ');
const freqValueDisplay = document.getElementById('freqValue');
const qValueDisplay = document.getElementById('qValue');

// Update value labels on screen when sliders move
if (filterFreqControl) {
    filterFreqControl.addEventListener('input', () => { freqValueDisplay.textContent = `${filterFreqControl.value} Hz`; });
}
if (filterQControl) {
    filterQControl.addEventListener('input', () => { qValueDisplay.textContent = filterQControl.value; });
}

// 3. Map our virtual piano notes to their exact mathematical frequencies
const noteFrequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
};

// Computer Keyboard Key Map Layout
const keyMap = {
    'KeyA': 'C4',
    'KeyW': 'C#4',
    'KeyS': 'D4',
    'KeyE': 'D#4',
    'KeyD': 'E4',
    'KeyF': 'F4',
    'KeyT': 'F#4',
    'KeyG': 'G4',
    'KeyY': 'G#4',
    'KeyH': 'A4',
    'KeyU': 'A#4',
    'KeyJ': 'B4',
    'KeyK': 'C5'
};

// 4. Function to play a note through the oscillator, filter, and gain stages
function playNote(frequency) {
    if (!frequency) return;

    // Create fresh nodes for this note instance
    const oscillator = audioCtx.createOscillator();
    const filterNode = audioCtx.createBiquadFilter(); 
    const gainNode = audioCtx.createGain();

    // Configure Oscillator (Waveform & Pitch)
    oscillator.type = waveformControl.value; 
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); 

    // Configure Filter (Type, Cutoff Frequency, and Q-Factor)
    filterNode.type = filterTypeControl.value; 
    filterNode.frequency.setValueAtTime(parseFloat(filterFreqControl.value), audioCtx.currentTime);
    filterNode.Q.setValueAtTime(parseFloat(filterQControl.value), audioCtx.currentTime);

    // Configure Volume / Gain Envelope
    const currentVolume = volumeControl ? parseFloat(volumeControl.value) * 0.5 : 0.25;
    gainNode.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);

    // NEW Week 4 Routing Chain: Generator -> Filter -> Volume -> Output Speakers
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Trigger playback
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.4);
}

// 5. Attach click event listeners to mouse interactions
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (event) => {
        event.stopPropagation();
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }

        const noteName = key.getAttribute('data-note');
        const frequency = noteFrequencies[noteName];

        console.log(`[Mouse Click] Note: ${noteName} | Freq: ${frequency}Hz`);
        playNote(frequency);
    });
});

// 6. Listen for Computer Keyboard Presses
window.addEventListener('keydown', (event) => {
    // If the user presses a key that isn't mapped, do nothing
    if (!keyMap[event.code]) return;

    // Prevent default browser shortcuts (like Ctrl+F or page scrolling)
    if (event.repeat) return; 

    if (audioCtx.state === 'suspended') { audioCtx.resume(); }

    const noteName = keyMap[event.code];
    const frequency = noteFrequencies[noteName];

    console.log(`[Keyboard Press] Key: ${event.key.toUpperCase()} -> Note: ${noteName} | Freq: ${frequency}Hz`);
    playNote(frequency);
});

window.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
});