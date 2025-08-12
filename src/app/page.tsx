import Link from "next/link";
import Image from "next/image";
import Button from "./components/button";
import Header from "./components/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0F7F6] relative overflow-x-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#E4F1EF] rounded-full z-0 opacity-90"></div>
        <div className="absolute top-[-50px] right-[-150px] w-[350px] h-[350px] bg-[#D8EDE9] rounded-full z-0 opacity-90"></div>
        <div className="absolute top-[200px] left-[-200px] w-[300px] h-[300px] bg-[#E8F4F1] rounded-full z-0 opacity-90"></div>
        <div className="absolute top-[400px] right-[-100px] w-[250px] h-[250px] bg-[#DCF0EC] rounded-full z-0 opacity-90"></div>

        {/* Navigation - Using unified header */}
        <Header state="public" />

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Illustration */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-3xl p-8 relative overflow-hidden shadow-lg">
              <div className="relative z-10">
                {/* Forest Scene Illustration */}
                <Image src="/imagien.jpg" width={600} height={600} alt="Playfull image of wildlife and school equipment" className="w-full h-auto lg:scale-100"/>
              </div>
            </div>
          </div>
          {/* Right - Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-[#1C1C1C] leading-tight">
                Skapa Lektionsplaner på 
                <span className="text-[#3E8E7E]"> 30 Sekunder</span>
              </h1>
              <p className="text-xl text-[#333] leading-relaxed">
                Sluta spendera 3-5 timmar varje vecka på att skapa lektionsplaner. 
                Vår AI följer Läroplanen och skapar kompletta planer på några sekunder.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-[#3E8E7E]/10 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-[#3E8E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#333] text-lg">Följer officiella Läroplanen</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-[#3E8E7E]/10 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-[#3E8E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-[#333] text-lg">Sparar 5 timmar per vecka</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-[#3E8E7E]/10 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-[#3E8E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-[#333] text-lg">Anpassat för alla årskurser</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login">
                <Button 
                  text="Skapa Min Första Lektion"
                  variant="primary"
                  size="lg"
                  className="px-8 py-3 rounded-xl"
                />
              </Link>
              <Button 
                text="Se Demo"
                variant="outline"
                size="lg"
                className="px-8 py-3 rounded-xl"
              />
            </div>
          </div>


        </div>

        {/* Example Section */}
        <div className="mt-32 bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/50 shadow-lg">
          <h2 className="text-3xl font-playfair font-bold text-[#1C1C1C] mb-8 text-center">
            Så Här Fungerar Det
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[#E4F1EF] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-7 h-7 text-[#3E8E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1C1C1C]">Fyll i Formulär</h3>
              <p className="text-[#333]">Tema, årskurs, ämnen och längd</p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[#E4F1EF] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-7 h-7 text-[#3E8E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1C1C1C]">AI Genererar</h3>
              <p className="text-[#333]">30 sekunder med Läroplanen som grund</p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[#E4F1EF] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-7 h-7 text-[#3E8E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1C1C1C]">Kopiera & Använd</h3>
              <p className="text-[#333]">Redigera och anpassa efter behov</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}