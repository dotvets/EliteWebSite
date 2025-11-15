import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon | "bullet";
  testId?: string;
  variant?: "default" | "compact";
}

export function FeatureCard({ 
  title, 
  description, 
  icon = "bullet", 
  testId,
  variant = "default" 
}: FeatureCardProps) {
  const Icon = icon === "bullet" ? null : icon;
  
  if (variant === "compact") {
    return (
      <Card className="hover-elevate h-full flex flex-col" data-testid={testId}>
        <CardHeader className="flex-1">
          <div className="flex items-start gap-3 h-full">
            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1 overflow-hidden">
              <CardTitle className="text-lg font-heading mb-2 leading-tight">
                {title}
              </CardTitle>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="hover-elevate" data-testid={testId}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {icon === "bullet" ? (
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
          ) : Icon ? (
            <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          ) : null}
          <div>
            <h3 className="text-xl font-semibold font-heading mb-2">
              {title}
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
