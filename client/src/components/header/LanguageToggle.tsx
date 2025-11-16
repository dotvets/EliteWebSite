import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageToggleProps {
  variant?: "default" | "ghost" | "outline";
  className?: string;
  testId?: string;
}

export function LanguageToggle({ 
  variant = "ghost", 
  className = "",
  testId = "button-language-toggle"
}: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <Button
      variant={variant}
      onClick={toggleLanguage}
      data-testid={testId}
      className={`gap-2 ${className}`}
    >
      <Globe className="w-5 h-5" />
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </Button>
  );
}
