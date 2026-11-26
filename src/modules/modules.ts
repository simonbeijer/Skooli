/**
 * Modulerna som visas i dashboardens meny.
 */

export interface ModuleLink {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}

export function getModules(): ModuleLink[] {
  return [
    {
      id: "lektionsplanering",
      title: "Lektionsplanering",
      description: "Generera en komplett lektionsplan med AI på 30 sekunder — anpassad efter Läroplanen.",
      cta: "Skapa Ny Lektion",
      href: "/lektionsplanering",
    },
    {
      // Fristående app tills den flyttas in som modul (steg 6–7).
      id: "grej-of-the-day",
      title: "Grej of the Day",
      description: "Skapa veckans grej som presentation — ledtrådar, fakta och bilder, klar att öppna i Google Presentationer.",
      cta: "Starta nu",
      href: process.env.NEXT_PUBLIC_GOTD_URL || "http://localhost:3001",
    },
  ];
}
