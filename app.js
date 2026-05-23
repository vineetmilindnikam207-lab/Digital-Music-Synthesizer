// 1. Initialize the Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Function to play a simple sound output
function playTestSound() {
    // 2. Create an Oscillator Node (The Generator)
    const oscillator = audioCtx.createOscillator();

    // 3. Experiment with types: 'sine', 'square', 'sawtooth', or 'triangle'
    oscillator.type = 'sine'; 
    
    // Set frequency in Hz (440Hz is standard musical note A4)
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 

    // 4. Connect the oscillator directly to the destination (Speakers)
    oscillator.connect(audioCtx.destination);
    // 5. Start generating sound immediately
    oscillator.start();

    // 6. Automatically stop the sound after 1 second so it doesn't hurt your ears
    oscillator.stop(audioCtx.currentTime + 1.0);
}

// Modern browsers block audio until a user interacts with the page.
// We will trigger the sound as soon as the user clicks anywhere on the screen!
window.addEventListener('click', () => {
    // Resume context if it's suspended by the browser security policy
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    console.log("Playing test sound output...");
    playTestSound();
}, { once: true }); // { once: true } ensures it only fires the first time you click