import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const teamMembers = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Veterinarian",
    initials: "SJ",
  },
  {
    name: "Dr. Michael Chen",
    role: "Surgical Specialist",
    initials: "MC",
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Pet Dentist",
    initials: "ER",
  },
  {
    name: "Dr. Ahmed Al-Mansour",
    role: "Emergency Care",
    initials: "AA",
  },
];

export default function TeamSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl lg:text-4xl font-bold font-heading text-foreground mb-4"
            data-testid="text-team-title"
          >
            Our Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our team of highly skilled veterinarians is committed to providing
            top-notch care for your furry companions. They're passionate about animal
            health & dedicated to providing the best possible medical services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="p-6 text-center hover-elevate"
              data-testid={`card-team-${index}`}
            >
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src="" alt={member.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
