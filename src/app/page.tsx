import Link from "next/link";
import Image from "next/image";
import Button from "./components/button";
import Header from "./components/header";
import { getModules } from "@/modules/modules";

export default function Home() {
  const modules = getModules();
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-shape-1 rounded-full z-0 opacity-90"></div>
        <div className="absolute top-[-50px] right-[-150px] w-[350px] h-[350px] bg-shape-2 rounded-full z-0 opacity-90"></div>
        <div className="absolute top-[200px] left-[-200px] w-[300px] h-[300px] bg-shape-3 rounded-full z-0 opacity-90"></div>
        <div className="absolute top-[400px] right-[-100px] w-[250px] h-[250px] bg-shape-4 rounded-full z-0 opacity-90"></div>

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
                <Image src="/hero-illustration.jpg" width={600} height={600} alt="Playfull image of wildlife and school equipment" className="w-full h-auto lg:scale-100"/>
              </div>
            </div>
          </div>
          {/* Right - Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-foreground leading-tight">
                Verktyg som gör
                <span className="text-primary"> Lärardagen Lättare</span>
              </h1>
              <p className="text-xl text-grey leading-relaxed">
                Skooli samlar AI-verktyg för lärare på ett ställe. Logga in en gång
                och planera lektioner eller bygg presentationer på några sekunder.
              </p>
            </div>

            <div className="space-y-4">
              {modules.map((module) => (
                <div key={module.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-grey text-lg">
                    <span className="font-semibold text-foreground">{module.title}</span> – {module.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login">
                <Button 
                  text="Utforska Verktygen"
                  variant="primary"
                  size="lg"
                  className="px-8 py-3 rounded-xl"
                />
              </Link>
              <Link href="/demo">
                <Button
                  text="Se Demo"
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 rounded-xl"
                />
              </Link>
            </div>
          </div>

        </div>

        {/* Example Section */}
        <div className="mt-32 bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/50 shadow-lg">
          <h2 className="text-3xl font-playfair font-bold text-foreground mb-8 text-center">
            Så Här Fungerar Det
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-shape-1 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Logga In</h3>
              <p className="text-grey">Ett konto för alla verktyg</p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-shape-1 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Välj Verktyg</h3>
              <p className="text-grey">Lektionsplan eller veckans grej – AI gör jobbet</p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-shape-1 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Använd Direkt</h3>
              <p className="text-grey">Anpassa planen eller öppna presentationen i klassrummet</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}