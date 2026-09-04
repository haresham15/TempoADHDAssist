// Client-Side Dynamic Auditory Anchoring Engine
// Uses the Web Audio API to synthesize low-stimulation grounding soundscapes without external audio assets.

export type AnchorMode = 'off' | 'brown' | 'pulse' | 'drone';

class AuditoryAnchorEngine {
  private ctx: AudioContext | null = null;
  private currentMode: AnchorMode = 'off';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private pulseTimer: number | null = null;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMode(): AnchorMode {
    return this.currentMode;
  }

  public stop() {
    if (this.pulseTimer !== null) {
      window.clearInterval(this.pulseTimer);
      this.pulseTimer = null;
    }

    if (this.masterGain && this.ctx) {
      // Smooth fade out to prevent clicks
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      } catch {
        // Audio node already disconnected
      }
    }

    setTimeout(() => {
      this.cleanupNodes();
      this.currentMode = 'off';
    }, 320);
  }

  private cleanupNodes() {
    this.activeNodes.forEach((node) => {
      try {
        if (typeof node === 'object' && 'stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        if (typeof node === 'object' && 'disconnect' in node) {
          node.disconnect();
        }
      } catch {
        // Node already stopped
      }
    });
    this.activeNodes = [];
    this.masterGain = null;
  }

  public setMode(mode: AnchorMode, volume: number = 0.35) {
    if (this.currentMode === mode) return;

    this.stop();

    if (mode === 'off') {
      this.currentMode = 'off';
      return;
    }

    // Allow previous mode to smoothly fade out
    setTimeout(() => {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, now);
      master.gain.linearRampToValueAtTime(Math.min(Math.max(volume, 0.05), 0.8), now + 0.4);
      master.connect(ctx.destination);
      this.masterGain = master;

      if (mode === 'brown') {
        this.startBrownNoise(ctx, master);
      } else if (mode === 'pulse') {
        this.startGroundingPulse(ctx, master);
      } else if (mode === 'drone') {
        this.startHarmonicDrone(ctx, master);
      }

      this.currentMode = mode;
    }, 340);
  }

  // 1. Brown Noise Generator: Down-regulates sympathetic autonomic nervous system
  private startBrownNoise(ctx: AudioContext, destination: GainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to keep it deep and soothing (low rumble)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  // 2. 65 BPM Grounding Rhythmic Pulse: Synchronizes vagal nerve pacing to ~65 BPM
  private startGroundingPulse(ctx: AudioContext, destination: GainNode) {
    const intervalMs = (60 / 65) * 1000; // ~923ms per beat

    const playBeat = () => {
      if (this.currentMode !== 'pulse' || !this.ctx) return;
      const t = ctx.currentTime;

      // Soft bass thud
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.25);

      oscGain.gain.setValueAtTime(0.5, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(oscGain);
      oscGain.connect(destination);

      osc.start(t);
      osc.stop(t + 0.32);

      // Subtle acoustic wood click on the off-beat
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(240, t + 0.02);
      click.frequency.exponentialRampToValueAtTime(120, t + 0.08);

      clickGain.gain.setValueAtTime(0.08, t + 0.02);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      click.connect(clickGain);
      clickGain.connect(destination);

      click.start(t + 0.02);
      click.stop(t + 0.1);
    };

    // Play first beat immediately
    playBeat();
    this.pulseTimer = window.setInterval(playBeat, intervalMs);
  }

  // 3. 432Hz Harmonic Warm Drone: Grounding ambient harmonic tone
  private startHarmonicDrone(ctx: AudioContext, destination: GainNode) {
    const rootFreq = 216; // 432Hz sub-octave

    // 3 harmonic oscillators (Root, Octave, Fifth)
    const freqs = [rootFreq, rootFreq * 2, rootFreq * 1.5];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Slight detune for natural acoustic warmth
      osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.4 : -0.3), ctx.currentTime);

      gain.gain.setValueAtTime(0.18 / (idx + 1), ctx.currentTime);

      osc.connect(gain);
      gain.connect(destination);
      osc.start();

      this.activeNodes.push(osc, gain);
    });

    // Subtle gentle low-frequency breathing filter
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 10 second cycle
    lfoGain.gain.setValueAtTime(15, ctx.currentTime);

    lfo.start();
    this.activeNodes.push(lfo, lfoGain);
  }
}

// Singleton audio anchor instance
let anchorInstance: AuditoryAnchorEngine | null = null;

export function getAuditoryAnchor(): AuditoryAnchorEngine {
  if (typeof window === 'undefined') {
    return new AuditoryAnchorEngine();
  }
  if (!anchorInstance) {
    anchorInstance = new AuditoryAnchorEngine();
  }
  return anchorInstance;
}
