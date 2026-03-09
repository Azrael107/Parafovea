import { useEffect, useState } from 'react';
import soundManager from '../systems/SoundManager';

export default function useSoundManager() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [sfxVolume, setSfxVolume] = useState(0.8);

  // Initialize sound manager
  useEffect(() => {
    soundManager.init();
    setIsLoaded(true);
  }, []);

  // Load all sound effects
  const loadSounds = async () => {
    try {
      // Background music
      await soundManager.loadSound('horror_bgm', '/sfx/horror-bgm.mp3', { loop: true });
      await soundManager.loadSound('horror_bgm2', '/sfx/horror-bgm2.mp3', { loop: true });
      await soundManager.loadSound('thriller_beats', '/sfx/thriller-beats.mp3', { loop: true });
      await soundManager.loadSound('unsettler', '/sfx/unsettler.mp3', { loop: true });
      await soundManager.loadSound('unsettler2', '/sfx/unsettler2.mp3', { loop: true });
      await soundManager.loadSound('unsettler3', '/sfx/unsettler3.mp3', { loop: true });
      
      // Player sounds
      await soundManager.loadSound('cyborg_breathing', '/sfx/player/cyborg-breathing.mp3', { loop: true });
      await soundManager.loadSound('walking', '/sfx/player/walking.mp3');
      await soundManager.loadSound('trotting', '/sfx/player/trotting.mp3');
      await soundManager.loadSound('cycling', '/sfx/player/cycling.mp3');
      await soundManager.loadSound('spinning', '/sfx/player/spinning.mp3', { loop: true });
      
      // Weapon sounds (using available files)
      await soundManager.loadSound('pistol_shoot', '/sfx/weapons/pistol-cock.mp3');
      await soundManager.loadSound('shotgun_shoot', '/sfx/weapons/shotgun-cock.mp3');
      await soundManager.loadSound('mg_shoot', '/sfx/weapons/machine-shot.mp3', { loop: true });
      await soundManager.loadSound('pistol_reload', '/sfx/weapons/pistol-cock.mp3'); // Reuse pistol cock for reload
      await soundManager.loadSound('shotgun_reload', '/sfx/weapons/shotgun-cock.mp3'); // Reuse shotgun cock for reload
      await soundManager.loadSound('mg_reload', '/sfx/weapons/machine-shot.mp3'); // Reuse machine shot for reload
      await soundManager.loadSound('sword_slash', '/sfx/weapons/axe-slash.mp3');
      await soundManager.loadSound('punch_hit', '/sfx/weapons/axe-slash.mp3'); // Reuse axe slash for punch
      
      // Environmental sounds
      await soundManager.loadSound('bear_sound', '/sfx/environs/bear-sound.mp3');
      await soundManager.loadSound('screeching', '/sfx/environs/screeching.mp3');
      
      // Other sounds
      await soundManager.loadSound('robot_laugh', '/sfx/robot-laughing-3-344764.mp3');
      await soundManager.loadSound('creepy_sound', '/sfx/creepy-sound.mp3');
      await soundManager.loadSound('crafting', '/sfx/crafting.mp3');
      await soundManager.loadSound('victory_sound', '/sfx/victory-sound.mp3');
      
      console.log('🎵 All sounds loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load sounds:', error);
    }
  };

  // Load a single sound file (useful for scene-specific audio)
  const loadSound = (name, url, options = {}) => {
    return soundManager.loadSound(name, url, options);
  };

  // Play background music
  const playMusic = (name, options = {}) => {
    return soundManager.playMusic(name, options);
  };

  // Play sound effect
  const playSFX = (name, options = {}) => {
    return soundManager.playSFX(name, options);
  };

  // Stop music
  const stopMusic = (fadeOut = 2000) => {
    soundManager.stopMusic(fadeOut);
  };

  // Stop all sounds
  const stopAll = () => {
    soundManager.stopAll();
  };

  // Volume controls
  const updateMasterVolume = (volume) => {
    setMasterVolume(volume);
    soundManager.setMasterVolume(volume);
  };

  const updateMusicVolume = (volume) => {
    setMusicVolume(volume);
    soundManager.setMusicVolume(volume);
  };

  const updateSfxVolume = (volume) => {
    setSfxVolume(volume);
    soundManager.setSFXVolume(volume);
  };

  // Mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
    soundManager.toggleMute();
  };

  return {
    isLoaded,
    isMuted,
    masterVolume,
    musicVolume,
    sfxVolume,
    loadSounds,
    loadSound,
    playMusic,
    playSFX,
    stopMusic,
    stopAll,
    updateMasterVolume,
    updateMusicVolume,
    updateSfxVolume,
    toggleMute
  };
}
