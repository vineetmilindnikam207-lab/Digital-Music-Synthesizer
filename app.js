// 1. Initialize the Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 2. Get references to our HTML interface elements
const volumeControl = document.getElementById('volume');
const waveformControl = document.getElementById('waveform');

// 3. Map our virtual piano notes to their exact mathematical frequencies (in Hz)
const noteFrequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
};

// 4. Function to play a specific frequency and waveform type
function playNote(frequency) {
    if (!frequency) return;

    // Create fresh oscillator and gain nodes for this note instance
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Set the waveform type dynamically based on user selection dropdown
    oscillator.type = waveformControl.value; // 'sine', 'square', 'sawtooth', or 'triangle'
    
    // Set the unique frequency (pitch control)
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); 

    // Read the current volume slider setting (max out at 0.5 to keep it safe)
    const currentVolume = parseFloat(volumeControl.value) * 0.5;
    gainNode.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
    
    // Smooth linear/exponential decay so notes fade out elegantly without popping
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);

    // Route: Generator -> Volume Controller -> Output Speakers
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Trigger playback
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.4);
}

// 5. Attach click event listeners to each interactive visual key
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (event) => {
        event.stopPropagation(); // Stops background window triggers

        // Browsers require a user gesture to unblock audio output
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const noteName = key.getAttribute('data-note');
        const frequency = noteFrequencies[noteName];

        console.log(`[Week 3 Engine] Playing ${noteName} | Freq: ${frequency}Hz | Waveform: ${waveformControl.value}`);
        playNote(frequency);
    });
});

// Fallback to unlock AudioContext if background space is clicked
window.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
});