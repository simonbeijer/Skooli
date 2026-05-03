"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/context/userContext";
import TermsModal from "@/components/termsModal";

export default function Dashboard() {
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const { user } = useUserContext();

  useEffect(() => {
    const termsAccepted = localStorage.getItem('skooli-terms-accepted');
    if (!termsAccepted) {
      setShowTermsModal(true);
    }
  }, []);

  const closeTermsModal = (): void => {
    setShowTermsModal(false);
  };

  const displayName = user?.name || 'John Doe';
  const initials = displayName.split(' ').map(n => n[0]).join('');

  return (
    <>
      <TermsModal isOpen={showTermsModal} onClose={closeTermsModal} showClose={false} projectName="Skooli" />

      <div className="relative z-20 w-full max-w-5xl mx-auto p-6">
        {/* Welcome Header with inline user identity */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-playfair font-bold text-foreground mb-2 leading-tight">
              Välkommen tillbaka, <span className="text-primary">{displayName.split(' ')[0]}</span>!
            </h1>
            <p className="text-lg text-grey leading-relaxed font-inter">
              Redo att skapa din nästa lektion?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-lg shrink-0">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground font-inter leading-tight">{displayName}</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium font-inter mt-0.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Aktiv
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY CTA: Skapa Ny Lektion - hero card */}
        <a
          href="/generate"
          className="group block relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-8 bg-gradient-to-br from-primary via-primary to-secondary shadow-xl hover:shadow-2xl transition-all duration-200 border border-white/20"
          aria-label="Skapa ny lektion"
        >
          {/* Decorative shapes */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-accent/20 rounded-full pointer-events-none"></div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1 max-w-xl">
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5 border border-white/30 font-inter">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Snabbåtgärd
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-white mb-3 leading-tight">
                Skapa Ny Lektion
              </h2>
              <p className="text-lg text-white/90 font-inter mb-6 leading-relaxed">
                Generera en komplett lektionsplan med AI på 30 sekunder — anpassad efter Läroplanen.
              </p>
              <div className="inline-flex items-center gap-2 bg-white text-primary font-semibold font-inter px-6 py-3 rounded-xl shadow-md group-hover:shadow-lg group-hover:gap-3 transition-all duration-200">
                <span>Starta nu</span>
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>

            {/* Decorative book icon */}
            <div className="hidden md:flex shrink-0 w-32 h-32 lg:w-40 lg:h-40 bg-white/15 backdrop-blur-sm rounded-3xl items-center justify-center border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-200">
              <svg className="w-16 h-16 lg:w-20 lg:h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </a>

        {/* SECONDARY: Compact user info strip */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:divide-x sm:divide-muted">
            <div className="flex items-center gap-3 sm:pr-4">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-grey/70 font-inter uppercase tracking-wide">E-post</p>
                <p className="text-sm text-foreground font-inter font-medium truncate">{user?.email || 'john.doe@example.com'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:px-4">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-grey/70 font-inter uppercase tracking-wide">Plats</p>
                <p className="text-sm text-foreground font-inter font-medium truncate">Göteborg, Sverige</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:pl-4">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-grey/70 font-inter uppercase tracking-wide">Medlem sedan</p>
                <p className="text-sm text-foreground font-inter font-medium truncate">Januari 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* TERTIARY: Mina Lektioner — coming soon teaser */}
        <div
          className="relative bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-dashed border-secondary/40 overflow-hidden"
          aria-label="Mina Lektioner — kommer snart"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Empty-state illustration */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-accent/20 rounded-2xl"></div>
              <div className="absolute inset-2 bg-secondary/20 rounded-xl"></div>
              <svg className="relative w-10 h-10 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-xl font-playfair font-bold text-foreground/70">Mina Lektioner</h3>
                <span className="inline-flex items-center gap-1.5 bg-accent/30 text-primary text-xs font-semibold px-3 py-1 rounded-full font-inter border border-accent/40">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Kommer snart
                </span>
              </div>
              <p className="text-grey/70 font-inter">
                Här kommer du snart kunna visa och hantera dina sparade lektionsplaner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
