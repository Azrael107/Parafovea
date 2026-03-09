import { useRef, useEffect, useState } from 'react';

class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.audioContext = null;
    this.masterVolume = 1.0;
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.isMuted = false;
    this.currentMusic = null;
    this.playingSounds = new Set();
  }

  safePlay(audio, soundName) {
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((error) => {
        // Common/expected in browsers when play is interrupted by pause or source swap.
        if (error?.name === 'AbortError') return;
        if (error?.name === 'NotAllowedError') return;
        console.warn(`Failed to play sound: ${soundName}`, error);
      });
    }
  }

  // Initialize audio context (required for modern browsers)
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Load a sound file
  loadSound(name, url, options = {}) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = (options.volume || 1.0) * this.sfxVolume;
      audio.loop = options.loop || false;
      
      audio.addEventListener('canplaythrough', () => {
        this.sounds.set(name, audio);
        resolve(audio);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`Failed to load sound: ${name}`, e);
        reject(e);
      });
    });
  }

  // Play a sound effect
  playSFX(name, options = {}) {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    // Clone the audio for overlapping sounds
    const audio = sound.cloneNode();
    audio.volume = (options.volume || 1.0) * this.sfxVolume * this.masterVolume;
    audio.loop = options.loop || false;
    audio.playbackRate = options.playbackRate || 1.0; // Add playback rate support
    
    if (options.fadeIn) {
      audio.volume = 0;
      this.safePlay(audio, name);
      this.fadeIn(audio, options.fadeIn);
    } else {
      this.safePlay(audio, name);
    }

    this.playingSounds.add(audio);
    
    audio.addEventListener('ended', () => {
      this.playingSounds.delete(audio);
    });

    return audio;
  }

  // Play background music
  playMusic(name, options = {}) {
    if (this.isMuted) return;
    
    // Stop current music if playing
    if (this.currentMusic) {
      this.stopMusic();
    }

    const music = this.sounds.get(name);
    if (!music) {
      console.warn(`Music not found: ${name}`);
      return;
    }

    this.currentMusic = music.cloneNode();
    this.currentMusic.volume = (options.volume || 1.0) * this.musicVolume * this.masterVolume;
    this.currentMusic.loop = true;
    
    if (options.fadeIn) {
      this.currentMusic.volume = 0;
      this.safePlay(this.currentMusic, name);
      this.fadeIn(this.currentMusic, options.fadeIn);
    } else {
      this.safePlay(this.currentMusic, name);
    }

    return this.currentMusic;
  }

  // Stop background music
  stopMusic(fadeOut = 2000) {
    if (!this.currentMusic) return;
    
    if (fadeOut > 0) {
      this.fadeOut(this.currentMusic, fadeOut).then(() => {
        this.currentMusic.pause();
        this.currentMusic = null;
      });
    } else {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }

  // Fade in effect
  fadeIn(audio, duration = 1000) {
    const startVolume = 0;
    const endVolume = audio.volume;
    const startTime = Date.now();
    
    const fade = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      audio.volume = startVolume + (endVolume - startVolume) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(fade);
      }
    };
    
    fade();
  }

  // Fade out effect
  fadeOut(audio, duration = 1000) {
    return new Promise((resolve) => {
      const startVolume = audio.volume;
      const startTime = Date.now();
      
      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        audio.volume = startVolume * (1 - progress);
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };
      
      fade();
    });
  }

  // Set master volume
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  // Set music volume
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume * this.masterVolume;
    }
  }

  // Set SFX volume
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  // Update all playing sounds' volumes
  updateAllVolumes() {
    this.playingSounds.forEach(sound => {
      if (sound.volume !== undefined) {
        sound.volume = sound.volume * this.masterVolume;
      }
    });
  }

  // Mute/unmute all sounds
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.playingSounds.forEach(sound => sound.pause());
      if (this.currentMusic) this.currentMusic.pause();
    } else {
      this.playingSounds.forEach(sound => sound.play());
      if (this.currentMusic) this.currentMusic.play();
    }
  }

  // Stop all sounds
  stopAll() {
    this.playingSounds.forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
    this.playingSounds.clear();
    this.stopMusic();
  }

  // Get sound info
  getSoundInfo(name) {
    const sound = this.sounds.get(name);
    return sound ? {
      duration: sound.duration,
      volume: sound.volume,
      paused: sound.paused,
      ended: sound.ended
    } : null;
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;
