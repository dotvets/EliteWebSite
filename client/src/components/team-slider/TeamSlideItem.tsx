import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamSlideItemProps {
  name: string;
  image?: string;
  initials: string;
  index: number;
}

export function TeamSlideItem({ name, image, initials, index }: TeamSlideItemProps) {
  return (
    <div className="flex-[0_0_100%] min-w-0 px-4">
      <div className="flex flex-col items-center">
        {image ? (
          <img
            src={image}
            alt={name}
            className="rounded-xl shadow-lg w-full h-auto object-cover"
            data-testid={`img-team-${index}`}
          />
        ) : (
          <Avatar className="w-full max-w-md aspect-square">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary text-6xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <h3 
          className="text-2xl sm:text-3xl font-bold font-heading text-foreground mt-12 sm:mt-16"
          data-testid={`text-team-name-${index}`}
        >
          {name}
        </h3>
      </div>
    </div>
  );
}
