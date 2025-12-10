import React, { useEffect, useRef, useContext } from 'react';
import { SoundContext } from '../context/SoundContext';

const BackgroundMusic = () => {
  const { isMuted } = useContext(SoundContext);
  const audioRef = useRef(new Audio('/Assets/sounds/background-music.mp3'));

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.1;

    if (!isMuted) {
      audio.play().catch(e => console.log("User needs to interact with the document first to play music."));
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [isMuted]);

  return null; // This component does not render anything visible
};

export default BackgroundMusic;