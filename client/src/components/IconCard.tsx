import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface IconCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  testId?: string;
}

export function IconCard({ icon: Icon, title, description, testId }: IconCardProps) {
  return (
    <Card className="h-full hover-elevate" data-testid={testId}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-8 h-8 text-primary" />
          <CardTitle className="text-2xl font-heading text-primary">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/80 leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
