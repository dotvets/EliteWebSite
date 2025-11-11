import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import backgroundMusicFile from "@assets/Elite Nabd ElHayah_[cut_215sec]_1762864510692.mp3";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.15;
    audio.loop = true;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log("Autoplay blocked, waiting for user interaction");
      }
    };

    playAudio();

    const handleInteraction = async () => {
      if (!isPlaying) {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Failed to play audio:", error);
        }
      }
    };

    document.addEventListener("click", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
    };
  }, [isPlaying]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={backgroundMusicFile} preload="auto" />
      
      <button
        onClick={toggleMute}
        className="fixed right-6 bottom-24 z-50 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover-elevate active-elevate-2"
        style={{
          boxShadow: "0 4px 20px rgba(119, 96, 168, 0.4)",
        }}
        data-testid="button-music-toggle"
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-primary" />
        ) : (
          <Volume2 className="w-6 h-6 text-primary" />
        )}
      </button>
    </>
  );
}
