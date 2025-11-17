import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { HeroOverlay } from "./HeroOverlay";
import { HeroContent } from "./HeroContent";
import { VideoControls } from "./VideoControls";
import { useTimeBasedVideo } from "./useTimeBasedVideo";
import { useVideoLazyLoad } from "./useVideoLazyLoad";
import heroDayVideo from "@assets/hero side video 1_1763369460755.mp4";

export default function HeroVideo() {
  const { language } = useLanguage();
  const t = translations[language].hero;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  
  const { containerRef, shouldLoad } = useVideoLazyLoad();
  const videoSrc = useTimeBasedVideo(heroDayVideo);
  
  const heroData = t.slides?.[0] || { 
    title: "Expert Veterinary Care, Tailored to Your Pet's Needs", 
    subtitle: "A Pioneering Veterinary Clinic, Providing Exceptional Care Every Step of the Way" 
  };
  const ctaText = t.cta || "Book an Appointment Now";

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[450px] h-[60vh] sm:h-[500px] md:h-[550px] lg:h-[700px] w-full overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {shouldLoad && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          data-testid="video-hero-background"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      <HeroOverlay />
      
      <HeroContent
        title={heroData.title}
        subtitle={heroData.subtitle}
        ctaText={ctaText}
      />

      <VideoControls
        isPlaying={isPlaying}
        isMuted={isMuted}
        onPlayPause={handlePlayPause}
        onMuteToggle={handleMuteToggle}
        isVisible={showControls}
      />
    </div>
  );
}
