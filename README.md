# Pro Virtual Web Synthesizer
> An interactive, browser-based audio synthesizer application built using native Web Audio API, vanilla JavaScript, and modern semantic HTML5/CSS3 grid layouts.

## 🚀 Live Deployment
The application is fully hosted and accessible on any desktop or mobile browser here:
👉 **[Launch Virtual Synthesizer](https://vineetmilindnikam207-lab.github.io/Digital-Music-Synthesizer/)**

---

## 🎹 Features & Control Panels

### 1. Oscillator Section (Signal Generator)
* **Master Volume Sliders:** Controls the output amplitude gain. Features a custom dynamic range constraint to prevent signal distortion.
* **Waveform Selector Profiles:** Switch between standard mathematical signal shapes:
    * `Sine`: Smooth, pure harmonic tone.
    * `Square`: Hollow, retro 8-bit chiptune texture.
    * `Sawtooth`: Bright, sharp, aggressive electronic buzz.
    * `Triangle`: Warm, flute-like mellow timbre.

### 2. Biquad Filter Panel (Signal Modifier)
* **Low-Pass Mode:** Attenuates high-frequency harmonics for a muffled, warmer sound.
* **High-Pass Mode:** Cuts off low-frequency sub-bass to create thinner, crisp textures.
* **Band-Pass Mode:** Isolates middle frequencies while rolling off the extremes.
* **Cutoff Slider:** Manually sweeps the threshold boundary (20 Hz - 20,000 Hz).
* **Q-Factor (Resonance):** Sharpens and sharpens the attenuation corner for classic electronic sweeping effects.

### 3. Time Delay Engine (Spatial Effects Loop)
* **Delay Interval Time:** Sets the rhythmic gap spacing (0 to 1.0 seconds) before echoes repeat.
* **Feedback Level Multiplier:** Controls the echo density decay rate loop cycle length.

### 4. Interactive 3D Piano Board
* 13-key standard musical layout mapped from octaves `C4` to `C5`.
* Features a responsive visual physical down-press state animation.

---

## ⌨️ Laptop Keyboard Bindings
You can perform musical notes smoothly using your laptop's physical keyboard using this integrated map layout:

| Note Profile | Computer Key Binding |
| :--- | :---: |
| **C4** (White Key) | `A` |
| **C#4** (Black Key) | `W` |
| **D4** (White Key) | `S` |
| **D#4** (Black Key) | `E` |
| **E4** (White Key) | `D` |
| **F4** (White Key) | `F` |
| **F#4** (Black Key) | `T` |
| **G4** (White Key) | `G` |
| **G#4** (Black Key) | `Y` |
| **A4** (White Key) | `H` |
| **A#4** (Black Key) | `U` |
| **B4** (White Key) | `J` |
| **C5** (White Key) | `K` |

---

## 🛠️ Optimizations & Bug Fixes
* **Anti-Clipping Limiter:** Integrated a native `DynamicsCompressorNode` right before the main speaker output destination. This serves as a safety brick-wall limiter to clamp signals at `-1.0 dB` and stop speaker clipping distortion when filter resonance or feedback volumes are maxed.
* **Anti-Pop Smoothing:** Modified instantaneous variable jumps using `setTargetAtTime` scheduling constants to smoothly blend filter adjustments, wiping out audio crackle pops during live slider movements.
* **Auto-Play Patch:** Handles strict mobile browser tracking rules by binding click events to wake up and resume the `AudioContext` from a suspended security state upon user gesture interaction.

---

## 📂 Project Architecture
```text
Digital-Music-Synthesizer/
├── synth.html     # Semantic user interface & responsive 3D keyboard design
├── app.js         # Audio engine routing architecture & event listeners
└── README.md      # User implementation documentation guide