import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import backgroundMusicFile from "@assets/Elite Nabd ElHayah_[cut_215sec]_1762864510692.mp3";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControl, setShowControl] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;
    audio.loop = true;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setTimeout(() => setShowControl(false), 3000);
      } catch (error) {
        console.log("Autoplay blocked, waiting for user interaction");
        setShowControl(true);
      }
    };

    playAudio();

    const handleInteraction = async () => {
      if (!isPlaying) {
        try {
          await audio.play();
          setIsPlaying(true);
          setTimeout(() => setShowControl(false), 3000);
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
      setShowControl(true);
      setTimeout(() => setShowControl(false), 2000);
    }
  };

  const handleMouseEnter = () => {
    setShowControl(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => setShowControl(false), 1000);
  };

  return (
    <>
      <audio ref={audioRef} src={backgroundMusicFile} preload="auto" />
      
      <div
        className="fixed top-6 right-6 z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-testid="container-background-music"
      >
        <AnimatePresence>
          {showControl && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={toggleMute}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover-elevate active-elevate-2"
              style={{
                boxShadow: "0 4px 20px rgba(119, 96, 168, 0.3)",
              }}
              data-testid="button-music-toggle"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-primary" />
              ) : (
                <Volume2 className="w-5 h-5 text-primary" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
