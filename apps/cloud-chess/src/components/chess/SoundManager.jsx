export class SoundManager {
  constructor() {
    this.enabled = true;
    this.sounds = {};
    this.audioContext = null;
    this.initSounds();
  }

  initSounds() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();

      this.sounds = {
        move: () => this.playTone(200, 0.1, 'sine'),
        capture: () => this.playTone(150, 0.15, 'square'),
        check: () => this.playTone(400, 0.2, 'sawtooth'),
        castle: () => this.playTone(250, 0.15, 'triangle'),
        gameStart: () => this.playChord([262, 330, 392], 0.3),
        gameEnd: () => this.playChord([523, 659, 784], 0.4),
        resetGame: () => this.playTone(300, 0.2, 'sine')
      };
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  playChord(frequencies, duration) {
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, duration), i * 50);
    });
  }

  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}