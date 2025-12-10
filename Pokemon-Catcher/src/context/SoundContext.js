import React, { createContext, useState, useRef } from 'react';

export const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  const backgroundMusicRef = useRef(null);

  const toggleMute = () => {
    setIsMuted(prevMuted => {
      const nextMuted = !prevMuted;
      if (!backgroundMusicRef.current) {
        // First time unmuting: create and play the audio
        backgroundMusicRef.current = new Audio('/Assets/sounds/background-music.mp3');
        backgroundMusicRef.current.loop = true;
        backgroundMusicRef.current.volume = 0.1;
      }

      if (nextMuted) {
        backgroundMusicRef.current.pause();
      } else {
        backgroundMusicRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      return nextMuted;
    });
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};