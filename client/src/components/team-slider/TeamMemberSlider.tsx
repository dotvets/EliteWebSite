import { useLanguage } from "@/contexts/LanguageContext";
import { useTeamSlider } from "./useTeamSlider";
import { TeamSlideItem } from "./TeamSlideItem";
import { SliderNavigation } from "../hero-slider/SliderNavigation";
import { SliderIndicators } from "../hero-slider/SliderIndicators";
import drKhaledImage from "@assets/dr-khaled-abu-elnasser.png";
import drAnasImage from "@assets/dr-anas-shobaki.png";
import drAhmedMandourImage from "@assets/dr-ahmed-mandour.png";
import drAhmedMounirImage from "@assets/dr-ahmed-mounir.png";
import drShoaibImage from "@assets/dr-shoaib-husnain.png";
import drEssamImage from "@assets/dr-essam-elmenshawy.png";

interface TeamMember {
  name: string;
  initials: string;
  image?: string;
}

interface TeamMemberSliderProps {
  members: TeamMember[];
}

const doctorImages = [
  drKhaledImage,
  drAnasImage,
  drAhmedMandourImage,
  drAhmedMounirImage,
  drShoaibImage,
  drEssamImage
];

export function TeamMemberSlider({ members }: TeamMemberSliderProps) {
  const { language } = useLanguage();
  
  const { emblaRef, selectedIndex, scrollPrev, scrollNext, scrollTo } = useTeamSlider({ language });

  const membersWithImages = members.map((member, index) => ({
    ...member,
    image: doctorImages[index]
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
