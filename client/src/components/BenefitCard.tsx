import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type BenefitCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  testId?: string;
};

export function BenefitCard({ icon: Icon, title, description, testId }: BenefitCardProps) {
  return (
    <Card
      className="p-6 text-center hover-elevate"
      data-testid={testId}
    >
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground font-body">{description}</p>
    </Card>
  );
}
