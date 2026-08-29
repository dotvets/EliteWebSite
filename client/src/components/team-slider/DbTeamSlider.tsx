import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TeamMemberSlider } from "./TeamMemberSlider";

// Renders team from the admin-managed DB collection when available,
// otherwise falls back to the built-in translation members.
export default function DbTeamSlider({ fallbackMembers }: { fallbackMembers: { name: string; initials: string }[] }) {
  const { language } = useLanguage();
  const [members, setMembers] = useState<any[] | null>(null);
  useEffect(() => {
    fetch("/api/public/team")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setMembers(rows.filter((m: any) => m.published === "true")))
      .catch(() => setMembers([]));
  }, []);
  if (members && members.length > 0) {
    return (
      <TeamMemberSlider
        members={members.map((m: any) => ({
          name: (language === "ar" ? m.nameAr : m.nameEn) || m.nameAr,
          initials: ((m.nameAr || m.nameEn || "?").trim()[0] || "?"),
          image: m.photo || undefined,
        }))}
      />
    );
  }
  return <TeamMemberSlider members={fallbackMembers} />;
}
