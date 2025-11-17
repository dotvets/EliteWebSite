import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  isVisible: boolean;
}

export function VideoControls({ 
  isPlaying, 
  isMuted, 
  onPlayPause, 
  onMuteToggle,
  isVisible 
}: VideoControlsProps) {
  return (
    <div 
      className={`absolute bottom-6 right-6 z-30 flex gap-2 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <Button
        size="icon"
        variant="ghost"
        onClick={onPlayPause}
        className="bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-black/60 hover:text-white"
        data-testid="button-video-play-pause"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={onMuteToggle}
        className="bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-black/60 hover:text-white"
        data-testid="button-video-mute-toggle"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
