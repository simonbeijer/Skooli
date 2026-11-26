"use client";

import { useEffect, useRef } from "react";
import { mountGotd } from "@/modules/grej-of-the-day/ui/app";
import "@/modules/grej-of-the-day/ui/gotd.css";

// Sidan är den fristående appens gränssnitt (ren JS) inne i Skoolis layout.
// mountGotd fyller diven med HTML och kopplar på allt. React rör inte innehållet.
export default function GrejOfTheDayPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return mountGotd(rootRef.current);
  }, []);

  return <div ref={rootRef} className="gotd" />;
}
