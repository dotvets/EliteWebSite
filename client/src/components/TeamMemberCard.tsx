import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TeamMemberCardProps = {
  name: string;
  role?: string;
  initials: string;
  image?: string;
  testId?: string;
};

export function TeamMemberCard({ name, role, initials, image, testId }: TeamMemberCardProps) {
  return (
    <Card
      className="p-6 text-center hover-elevate h-full"
      data-testid={testId}
    >
      <Avatar className="w-24 h-24 mx-auto mb-4">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary text-xl">
          {initials}
        </AvatarFallback>
      </Avatar>
      <h3 className="text-lg font-semibold font-heading text-foreground">
        {name}
      </h3>
    </Card>
  );
}
