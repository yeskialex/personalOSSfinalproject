import { useMemo, useContext } from 'react';
import { SoundContext } from '../context/SoundContext';

export const useSound = (soundPath, volume = 1.0) => {
  const { isMuted } = useContext(SoundContext);
  const audio = useMemo(() => {
    const a = new Audio(soundPath);
    a.volume = volume;
    return a;
  }, [soundPath, volume]);

  const play = () => {
    if (!isMuted) {
      audio.play().catch(err => console.error("Failed to play sound:", err));
    }
  };

  return play;
};