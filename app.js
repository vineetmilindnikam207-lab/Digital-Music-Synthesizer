// 1. Initialize the Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Function to create and play a new sound wave on demand
function playSynthTone() {
    // ALWAYS create a fresh oscillator node when a note is triggered
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain(); // This acts as our volume control

    oscillator.type = 'sine'; 
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // 440Hz (Note A)

    // Set the volume (0.2 keeps it from blowing out your speakers)
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    
    // Quick fade-out effect so the notes sound smooth and don't pop
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

    // Route: Oscillator -> Volume Control -> Speakers
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Start and stop this specific sound wave instance
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

// Listen for EVERY click on the window (removed "{ once: true }")
window.addEventListener('click', () => {
    // Ensure the audio context is active (browsers require user interaction)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    console.log("Triggering synthesizer tone!");
    playSynthTone();
});