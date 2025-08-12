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

  return (
    <>
      <TermsModal isOpen={showTermsModal} onClose={closeTermsModal} showClose={false} projectName="Skooli" />
      
      <div className="relative z-20 w-full max-w-4xl mx-auto p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-playfair font-bold text-[#1C1C1C] mb-4 leading-tight">Välkommen Tillbaka!</h1>
          <p className="text-xl text-[#333] leading-relaxed font-inter">Här är din användarinformation och instrumentpanelsöversikt.</p>
        </div>

        {/* Main Dashboard Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg relative z-20 mb-8">
          {/* User Info Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-8 bg-[#3E8E7E]/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3E8E7E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-playfair font-bold text-[#1C1C1C]">Användarinformation</h2>
          </div>

          {/* User Profile Section */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#3E8E7E] to-[#88C9BF] rounded-2xl flex items-center justify-center text-white font-semibold text-2xl shadow-lg">
              {(user?.name || 'John Doe').split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-playfair font-bold text-[#1C1C1C]">{user?.name || 'John Doe'}</h3>
              <span className="inline-block bg-[#88C9BF]/20 text-[#3E8E7E] text-sm px-4 py-2 rounded-full font-medium w-fit border border-[#88C9BF]/30">
                Aktiv
              </span>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-[#3E8E7E]/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#3E8E7E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-semibold text-[#1C1C1C] font-inter">E-post</span>
              </div>
              <p className="text-[#333] font-inter">{user?.email || 'john.doe@example.com'}</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-[#3E8E7E]/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#3E8E7E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-[#1C1C1C] font-inter">Plats</span>
              </div>
              <p className="text-[#333] font-inter">Göteborg, Sverige</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-[#3E8E7E]/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#3E8E7E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-semibold text-[#1C1C1C] font-inter">Medlem Sedan</span>
              </div>
              <p className="text-[#333] font-inter">Januari 2024</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg relative z-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 bg-[#3E8E7E]/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3E8E7E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-playfair font-bold text-[#1C1C1C]">Snabbåtgärder</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="/generate" className="group bg-gradient-to-br from-[#3E8E7E] to-[#88C9BF] rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-playfair font-bold mb-1">Skapa Ny Lektion</h3>
                  <p className="text-white/90 font-inter">Generera lektionsplaner med AI på 30 sekunder</p>
                </div>
              </div>
            </a>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-[#3E8E7E]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#3E8E7E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-playfair font-bold text-[#1C1C1C] mb-1">Mina Lektioner</h3>
                  <p className="text-[#333] font-inter">Visa och hantera sparade lektionsplaner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}