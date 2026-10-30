/**
 * CleanRoom Writer | Synthesized WebAudio Acoustic Layer
 * Inspired by Virtually Ever After (VEA) Sound Engine
 * 
 * Fully synthesized via native WebAudio API (Zero external MP3 dependencies).
 * Provides cleanroom airlock air-glide, calibrated micropipette click, and harmonic inspection settles.
 */

(function () {
  'use strict';

  let ctx = null;
  let masterGain = null;
  let sfxGain = null;
  let airGain = null;
  let airSource = null;
  let isSoundActive = false;

  // Reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initAudioContext() {
    if (ctx) return true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      ctx = new AudioCtx();

      // Master Gain
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);

      // Lowpass filter for smooth warmth
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(14000, ctx.currentTime);
      lowpass.Q.setValueAtTime(0.5, ctx.currentTime);

      // Compressor to avoid clipping
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.setValueAtTime(-20, ctx.currentTime);
      comp.knee.setValueAtTime(20, ctx.currentTime);
      comp.ratio.setValueAtTime(4, ctx.currentTime);

      masterGain.connect(lowpass);
      lowpass.connect(comp);
      comp.connect(ctx.destination);

      // SFX Bus
      sfxGain = ctx.createGain();
      sfxGain.gain.setValueAtTime(0.35, ctx.currentTime);
      sfxGain.connect(masterGain);

      // Ambient Airflow Bus
      airGain = ctx.createGain();
      airGain.gain.setValueAtTime(0.04, ctx.currentTime);
      airGain.connect(masterGain);

      return true;
    } catch (e) {
      console.warn('WebAudio initialization safely failed:', e);
      return false;
    }
  }

  // Synthesize laminar cleanroom air-glide noise
  function startAirGlide() {
    if (!ctx || airSource) return;
    try {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink-ish noise filter
        lastOut = (lastOut * 0.95) + (white * 0.05);
        output[i] = lastOut;
      }

      airSource = ctx.createBufferSource();
      airSource.buffer = noiseBuffer;
      airSource.loop = true;

      // Filtered to low soothing frequency (Laminar air flow hum)
      const airFilter = ctx.createBiquadFilter();
      airFilter.type = 'bandpass';
      airFilter.frequency.setValueAtTime(260, ctx.currentTime);
      airFilter.Q.setValueAtTime(1.2, ctx.currentTime);

      airSource.connect(airFilter);
      airFilter.connect(airGain);
      airSource.start(0);
    } catch (e) {}
  }

  function stopAirGlide() {
    if (airSource) {
      try {
        airSource.stop();
        airSource.disconnect();
      } catch (e) {}
      airSource = null;
    }
  }

  // Soft pipette calibration click
  function playClick(pitch = 540) {
    if (!isSoundActive || !ctx || ctx.state !== 'running') return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.035);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  // Soft hover tick
  function playHover() {
    if (!isSoundActive || !ctx || ctx.state !== 'running') return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.02);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(t);
      osc.stop(t + 0.025);
    } catch (e) {}
  }

  // Resonant Inspection Reveal (Harmonic Settle)
  function playInspectChime() {
    if (!isSoundActive || !ctx || ctx.state !== 'running') return;
    try {
      const t = ctx.currentTime;
      const freqs = [330, 495, 660];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + i * 0.04);

        gain.gain.setValueAtTime(0.12 / (i + 1), t + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(t + i * 0.04);
        osc.stop(t + 0.55);
      });
    } catch (e) {}
  }

  // Public Interface
  window.CleanRoomAudio = {
    toggle: function () {
      if (!ctx) {
        initAudioContext();
      }

      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }

      isSoundActive = !isSoundActive;

      if (isSoundActive) {
        if (masterGain && ctx) {
          masterGain.gain.cancelScheduledValues(ctx.currentTime);
          masterGain.gain.setValueAtTime(0, ctx.currentTime);
          masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.4);
        }
        startAirGlide();
        playClick(880);
      } else {
        if (masterGain && ctx) {
          masterGain.gain.cancelScheduledValues(ctx.currentTime);
          masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        }
        setTimeout(stopAirGlide, 250);
      }

      return isSoundActive;
    },
    isActive: function () {
      return isSoundActive;
    },
    click: function (pitch) {
      playClick(pitch);
    },
    hover: function () {
      playHover();
    },
    inspect: function () {
      playInspectChime();
    }
  };
})();
