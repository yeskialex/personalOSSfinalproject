import { useState, useEffect } from "react";
import "./intro.css";

export default function IntroAnimation({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 3500);
  }, []);

  if (!visible) return null;

  return (
    <div className="intro-screen">
      <img src="/pokeball.gif" className="intro-pokeball" alt="Loading" />
      <h1 className="intro-title">Pokemon Catcher</h1>
    </div>
  );
}
