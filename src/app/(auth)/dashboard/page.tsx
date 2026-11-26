"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/context/userContext";
import TermsModal from "@/components/termsModal";
import { getModules } from "@/modules/modules";

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
              Välj vad du vill göra.
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

        {/* Module menu */}
        <nav aria-label="Moduler" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getModules().map((module) => (
            <a
              key={module.id}
              href={module.href}
              className="group block relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-primary via-primary to-secondary shadow-xl hover:shadow-2xl transition-all duration-200 border border-white/20"
            >
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full pointer-events-none"></div>
              <div className="relative">
                <h2 className="text-3xl font-playfair font-bold text-white mb-3 leading-tight">
                  {module.title}
                </h2>
                <p className="text-lg text-white/90 font-inter mb-6 leading-relaxed">
                  {module.description}
                </p>
                <div className="inline-flex items-center gap-2 bg-white text-primary font-semibold font-inter px-6 py-3 rounded-xl shadow-md group-hover:shadow-lg group-hover:gap-3 transition-all duration-200">
                  <span>{module.cta}</span>
                  <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
