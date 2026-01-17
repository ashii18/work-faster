import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import playImg from "./assets/play.png";
import resetImg from "./assets/reset.png";
import workBtnClicked from "./assets/work-clicked.png";
import workBtn from "./assets/work.png";
import breakBtnClicked from "./assets/break-clicked.png";
import breakBtn from "./assets/break.png";
import idleGif from "./assets/idle.gif";
import workGif from "./assets/work.gif";
import breakGif from "./assets/break.gif";
import meowSound from "./assets/meow.mp3";
import closeBtn from "./assets/close.png";

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [gifImage, setGifImage] = useState(idleGif);
  const [image, setImage] = useState(playImg);
  const [encouragement, setEncouragement] = useState("");

  const [breakButtonImage, setBreakButtonImage] = useState(breakBtn);
  const [workButtonImage, setWorkButtonImage] = useState(workBtn);

  /** ✅ iOS-safe audio */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);

  const cheerMessages = [
    "You Can Do It!",
    "I believe in you!",
    "You're amazing!",
    "Keep going!",
    "Stay focused!",
  ];

  const breakMessages = [
    "Stay hydrated!",
    "Snacks, maybe?",
    "Text me!",
    "I love you <3",
    "Stretch your legs!",
  ];

  /** Initialize audio once */
  useEffect(() => {
    audioRef.current = new Audio(meowSound);
    audioRef.current.preload = "auto";
  }, []);

  /** Encouragement messages */
  useEffect(() => {
    if (!isRunning) {
      setEncouragement("");
      return;
    }

    const messages = isBreak ? breakMessages : cheerMessages;
    let index = 0;
    setEncouragement(messages[index]);

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setEncouragement(messages[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  /** Countdown */
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  /** Timer finished */
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setGifImage(idleGif);
      setImage(playImg);
      setTimeLeft(isBreak ? 5 * 60 : 25 * 60);

      // ✅ SAFE PLAY (works on iOS now)
      audioRef.current?.play().catch(() => {});
    }
  }, [timeLeft, isRunning, isBreak]);

  /** Unlock audio on first user tap */
  const unlockAudio = async () => {
    if (!audioRef.current || audioUnlocked.current) return;

    try {
      audioRef.current.muted = true;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.muted = false;
      audioUnlocked.current = true;
    } catch {
      // ignored
    }
  };

  const handleClick = async () => {
    await unlockAudio();

    if (!isRunning) {
      setIsRunning(true);
      setGifImage(isBreak ? breakGif : workGif);
      setImage(resetImg);
    } else {
      setIsRunning(false);
      setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
      setGifImage(idleGif);
      setImage(playImg);
    }
  };

  const switchMode = (breakMode: boolean) => {
    setIsBreak(breakMode);
    setIsRunning(false);
    setTimeLeft(breakMode ? 5 * 60 : 25 * 60);
    setGifImage(idleGif);
    setBreakButtonImage(breakMode ? breakBtnClicked : breakBtn);
    setWorkButtonImage(breakMode ? workBtn : workBtnClicked);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleCloseClick = () => {
    window.electronAPI?.closeApp?.();
  };

  return (
    <div className={`home-container ${isRunning ? "background-green" : ""}`}>
      <button className="close-button" onClick={handleCloseClick}>
        <img src={closeBtn} alt="Close" />
      </button>

      <div className="home-content">
        <div className="home-controls">
          <button className="image-button" onClick={() => switchMode(false)}>
            <img src={workButtonImage} alt="Work" />
          </button>
          <button className="image-button" onClick={() => switchMode(true)}>
            <img src={breakButtonImage} alt="Break" />
          </button>
        </div>

        <p className={`encouragement-text ${!isRunning ? "hidden" : ""}`}>
          {encouragement}
        </p>

        <h1 className="home-timer">{formatTime(timeLeft)}</h1>
        <img src={gifImage} alt="Status" className="gif-image" />

        <button className="home-button" onClick={handleClick}>
          <img src={image} alt="Control" />
        </button>
      </div>
    </div>
  );
}

export default App;
