import { useLanguage } from "@/contexts/LanguageContext";
import { useTeamSlider } from "./useTeamSlider";
import { TeamSlideItem } from "./TeamSlideItem";
import { SliderNavigation } from "../hero-slider/SliderNavigation";
import { SliderIndicators } from "../hero-slider/SliderIndicators";
import drKhaledImage from "@assets/dr-khaled-abu-elnasser.png";

interface TeamMember {
  name: string;
  initials: string;
  image?: string;
}

interface TeamMemberSliderProps {
  members: TeamMember[];
}

export function TeamMemberSlider({ members }: TeamMemberSliderProps) {
  const { language } = useLanguage();
  
  const { emblaRef, selectedIndex, scrollPrev, scrollNext, scrollTo } = useTeamSlider({ language });

  const membersWithImages = members.map((member, index) => ({
    ...member,
    image: index === 0 ? drKhaledImage : undefined
  }));

  return (
    <div className="relative w-full max-w-4xl mx-auto" key={language}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {membersWithImages.map((member, index) => (
            <TeamSlideItem
              key={index}
              name={member.name}
              image={member.image}
              initials={member.initials}
              index={index}
            />
          ))}
        </div>
      </div>

      <SliderNavigation onPrev={scrollPrev} onNext={scrollNext} />
      
      <SliderIndicators 
        count={membersWithImages.length} 
        selectedIndex={selectedIndex} 
        onSelect={scrollTo} 
      />
    </div>
  );
}
