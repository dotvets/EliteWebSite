import { useMemo } from "react";

export function useTimeBasedVideo(dayVideo: string, nightVideo?: string) {
  const videoSrc = useMemo(() => {
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 6 && currentHour < 18;
    
    return isDaytime ? dayVideo : (nightVideo || dayVideo);
  }, [dayVideo, nightVideo]);

  return videoSrc;
}
