import { Card } from "@/components/ui/card";

type PartnerCardProps = {
  name: string;
  delay?: number;
};

export function PartnerCard({ name }: PartnerCardProps) {
  return (
    <Card className="p-8 w-64 h-32 flex items-center justify-center hover-elevate">
      <div className="text-center">
        <p className="text-2xl font-semibold text-primary">{name}</p>
      </div>
    </Card>
  );
}
