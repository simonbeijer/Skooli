"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUserContext } from "@/context/userContext";
import Spinner from "@/components/spinner";
import Button from "@/components/button";
import Header from "@/components/header";
import type { LoginFormData } from "@/types";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const { setUser } = useUserContext();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Basic client-side validation
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setLoading(false);
      setError(true);
      return;
    }
    
    if (!password) {
      setLoading(false);
      setError(true);
      return;
    }

    try {
      const loginData: LoginFormData = { email, password };
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🎉 Login successful for user:', data.user.email);
        console.log('🚀 Redirecting to dashboard...');
        setUser(data.user);
        router.push("/dashboard");
      } else {
        console.error('❌ Login failed:', response.status);
        setError(true);
      }
    } catch (error) {
      console.error('❌ Login error:', error instanceof Error ? error.message : 'Unknown error');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7F6] relative overflow-x-hidden">
      {/* Abstract Background Shapes - positioned to stay behind content on all screen sizes */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#E4F1EF] rounded-full opacity-60 sm:opacity-90 z-0"></div>
      <div className="absolute top-[-50px] right-[-150px] w-[350px] h-[350px] bg-[#D8EDE9] rounded-full opacity-60 sm:opacity-90 z-0"></div>
      <div className="absolute top-[200px] left-[-200px] w-[300px] h-[300px] bg-[#E8F4F1] rounded-full opacity-60 sm:opacity-90 z-0"></div>
      <div className="absolute top-[400px] right-[-100px] w-[250px] h-[250px] bg-[#DCF0EC] rounded-full opacity-60 sm:opacity-90 z-0"></div>

      {/* Navigation */}
      <Header state="login" />

      <main className="relative z-20 max-w-md mx-auto px-6 py-16">
        <div className="bg-[#3E8E7E]/90 backdrop-blur-sm rounded-3xl p-8 border border-[#3E8E7E]/50 shadow-lg relative z-20">
          {/* Logo Section */}
          <div className="text-center mb-8">
            {/* Forest logo from public folder */}
            <div className="relative mx-auto mb-6 w-40 h-40">
              <Image 
                src="/logo-forest.png" 
                alt="Skooli Forest Logo" 
                width={160} 
                height={160}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Brand name */}
            <h1 className="text-3xl font-playfair font-bold text-white mb-6">Skooli</h1>
            
            {/* Welcome text - following style guide typography hierarchy */}
            <div className="mb-8 space-y-4">
              <h2 className="text-3xl font-playfair font-bold text-white leading-tight">Välkommen</h2>
              <p className="text-xl text-white/90 leading-relaxed">Logga in för att fortsätta</p>
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {loading ? (
              <div className="text-center py-8 space-y-4">
                <Spinner color="white" />
                <div className="space-y-2">
                  <h3 className="text-lg font-playfair font-bold text-white">Loggar In...</h3>
                  <p className="text-white/80">Verifierar dina uppgifter</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-white">
                    E-post <span className="text-red-300">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ange din e-postadress"
                    required
                    className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-base text-[#1C1C1C] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 ${
                      error 
                        ? "border-red-300 focus-visible:ring-red-300" 
                        : "border-gray-300 focus:border-white"
                    }`}
                  />
                  {error && (
                    <p className="text-sm text-red-200 mt-1">Felaktig e-post eller lösenord</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-white">
                    Lösenord <span className="text-red-300">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ange ditt lösenord"
                    required
                    className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-base text-[#1C1C1C] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 ${
                      error 
                        ? "border-red-300 focus-visible:ring-red-300" 
                        : "border-gray-300 focus:border-white"
                    }`}
                  />
                  {error && (
                    <p className="text-sm text-red-200 mt-1">Felaktig e-post eller lösenord</p>
                  )}
                </div>
                {error && (
                  <p className="text-red-200 text-sm text-center bg-red-500/20 p-3 rounded-lg">
                    Inloggningen misslyckades. Kontrollera din e-post och lösenord.
                  </p>
                )}
                <Button 
                  text="Logga In" 
                  disabled={loading} 
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="w-full bg-white text-[#3E8E7E] hover:bg-white hover:text-[#2d6b5e] border-white font-semibold"
                />
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}