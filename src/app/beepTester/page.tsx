"use client";
import { useEffect } from "react";

export default function TestAudio() {
  useEffect(() => {
    const audio = new Audio("/beep.mp3");

    audio.addEventListener("loadeddata", () => {
      console.log("Audio loaded successfully");
      audio.play().catch((e) => console.error("Error playing audio:", e));
    });

    audio.addEventListener("error", (e) => {
      console.error("Error loading audio:", e);
      console.error("Resolved audio path:", audio.src);
    });
  }, []);

  return <div>Check console for audio playback logs.</div>;
}
