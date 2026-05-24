const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// UI Selectors
const volSlider = document.getElementById('volume');
const waveSelect = document.getElementById('waveform');
const filterType = document.getElementById('filterType');
const filterFreq = document.getElementById('filterFreq');
const filterQ = document.getElementById('filterQ');
const delayTime = document.getElementById('delayTime');
const delayFeedback = document.getElementById('delayFeedback');

// Real-time value display updating
if (filterFreq) filterFreq.addEventListener('input', e => { document.getElementById('freqValue').textContent = `${e.target.value} Hz`; });
if (filterQ) filterQ.addEventListener('input', e => { document.getElementById('qValue').textContent = parseFloat(e.target.value).toFixed(1); });
if (delayTime) delayTime.addEventListener('input', e => { document.getElementById('delayTimeValue').textContent = `${parseFloat(e.target.value).toFixed(2)} s`; });
if (delayFeedback) delayFeedback.addEventListener('input', e => { document.getElementById('feedbackValue').textContent = parseFloat(e.target.value).toFixed(2); });

const NOTES = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
};

const KEY_MAP = {
    'a': 'C4',  'w': 'C#4', 's': 'D4',  'e': 'D#4', 'd': 'E4',
    'f': 'F4',  't': 'F#4', 'g': 'G4',  'y': 'G#4', 'h': 'A4',  
    'u': 'A#4', 'j': 'B4',  'k': 'C5'
};

function playNote(freq) {
    if (!freq || isNaN(freq)) return;

    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain(); 
    const delay = audioCtx.createDelay(1.0); 
    const feedback = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();

    // Limiter settings to prevent clipping distortion
    compressor.threshold.setValueAtTime(-1.0, now);
    compressor.knee.setValueAtTime(0.0, now);
    compressor.ratio.setValueAtTime(20.0, now);
    compressor.attack.setValueAtTime(0.005, now);
    compressor.release.setValueAtTime(0.05, now);

    osc.type = waveSelect ? waveSelect.value : 'sine'; 
    osc.frequency.setValueAtTime(freq, now); 

    filter.type = filterType ? filterType.value : 'lowpass'; 
    const fTarget = filterFreq ? parseFloat(filterFreq.value) : 20000;
    const qTarget = filterQ ? parseFloat(filterQ.value) : 1;
    
    // setTargetAtTime smooths parameter sweeps to stop click-pops mid note
    filter.frequency.setTargetAtTime(fTarget, now, 0.01);
    filter.Q.setTargetAtTime(qTarget, now, 0.01);

    // Audio Envelope configuration
    const userVol = volSlider ? parseFloat(volSlider.value) : 0.5;
    const masterVol = Math.min(Math.max(userVol, 0), 1) * 0.5; 
    
    gainNode.gain.setValueAtTime(masterVol, now);
    
    const hold = 0.3;
    const fade = 0.4;
    const duration = hold + fade; 
    
    gainNode.gain.setValueAtTime(masterVol, now + hold);
    gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

    const dTime = delayTime ? parseFloat(delayTime.value) : 0.3;
    const dFeed = delayFeedback ? parseFloat(delayFeedback.value) : 0.4;
    delay.delayTime.setValueAtTime(Math.min(dTime, 1.0), now);
    feedback.gain.setValueAtTime(Math.min(dFeed, 0.9), now);

    // Node connections
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(compressor);
    
    // Echo routing path
    gainNode.connect(delay);           
    delay.connect(feedback);       
    feedback.connect(delay);       
    delay.connect(compressor);
    
    compressor.connect(audioCtx.destination); 
    
    osc.start(now);
    osc.stop(now + duration + 0.05); // Small padding buffer to ensure silent cutoff
}

// Mouse event bindings
document.querySelectorAll('.key').forEach(k => {
    k.addEventListener('click', e => {
        e.stopPropagation();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const note = k.getAttribute('data-note');
        if (note) playNote(NOTES[note]);
    });
});

// Physical keyboard mapping logic
window.addEventListener('keydown', e => {
    if (e.target.tagName === 'SELECT' || e.repeat) return;
    const key = e.key.toLowerCase();
    if (KEY_MAP[key]) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const note = KEY_MAP[key];
        const targetKey = document.querySelector(`.key[data-note="${note}"]`);
        if (targetKey) targetKey.classList.add('active-pressed');
        playNote(NOTES[note]);
    }
});

window.addEventListener('keyup', e => {
    const key = e.key.toLowerCase();
    if (KEY_MAP[key]) {
        const note = KEY_MAP[key];
        const targetKey = document.querySelector(`.key[data-note="${note}"]`);
        if (targetKey) targetKey.classList.remove('active-pressed');
    }
});

window.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
});