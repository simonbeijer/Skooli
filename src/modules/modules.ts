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
      id: "grej-of-the-day",
      title: "Grej of the Day",
      description: "Skapa veckans grej som presentation — ledtrådar, fakta och bilder, klar att öppna i Google Presentationer.",
      cta: "Starta nu",
      href: "/grej-of-the-day",
    },
  ];
}
