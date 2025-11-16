import { useState } from "react";

export function useExpandableCards() {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (key: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isExpanded = (key: string) => expandedCards[key] || false;

  return {
    expandedCards,
    toggleCard,
    isExpanded
  };
}
