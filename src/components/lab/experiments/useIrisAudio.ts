"use client";

import { useCallback, useEffect, useRef } from "react";

const VIOLIN_FREQS = [196, 293.66, 392, 493.88, 587.33];

export function useIrisAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const dataRef = useRef<Uint8Array | null>(null);
  const playingRef = useRef(false);
  const mutedRef = useRef(false);

  const stopOscillators = () => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        /* already stopped */
      }
    });
    oscillatorsRef.current = [];
  };

  const start = useCallback(() => {
    if (playingRef.current) return;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;

    const masterGain = ctx.createGain();
    masterGain.gain.value = mutedRef.current ? 0 : 0.14;

    const mixGain = ctx.createGain();
    mixGain.gain.value = 1;

    VIOLIN_FREQS.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.22 / VIOLIN_FREQS.length;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 4 + i;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(oscGain);
      oscGain.connect(mixGain);
      osc.start();
      oscillatorsRef.current.push(osc, lfo);
    });

    mixGain.connect(analyser);
    analyser.connect(masterGain);
    masterGain.connect(ctx.destination);

    ctxRef.current = ctx;
    analyserRef.current = analyser;
    gainRef.current = masterGain;
    dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    playingRef.current = true;
  }, []);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    if (gainRef.current) {
      gainRef.current.gain.setTargetAtTime(
        mutedRef.current ? 0 : 0.14,
        ctxRef.current?.currentTime ?? 0,
        0.05,
      );
    }
  }, []);

  const getFrequencyData = useCallback(() => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return null;
    analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
    return data;
  }, []);

  const isPlaying = useCallback(() => playingRef.current, []);

  useEffect(() => {
    return () => {
      stopOscillators();
      ctxRef.current?.close();
      playingRef.current = false;
    };
  }, []);

  return { start, toggleMute, getFrequencyData, isPlaying, playingRef, mutedRef };
}
