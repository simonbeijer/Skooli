import type { ReactNode } from "react";
import Header from "@/components/header";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F0F7F6] relative overflow-x-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#E4F1EF] rounded-full opacity-60 sm:opacity-90 z-0"></div>
      <div className="absolute top-[-50px] right-[-150px] w-[350px] h-[350px] bg-[#D8EDE9] rounded-full opacity-60 sm:opacity-90 z-0"></div>
      <div className="absolute top-[200px] left-[-200px] w-[300px] h-[300px] bg-[#E8F4F1] rounded-full opacity-60 sm:opacity-90 z-0"></div>
      <div className="absolute top-[400px] right-[-100px] w-[250px] h-[250px] bg-[#DCF0EC] rounded-full opacity-60 sm:opacity-90 z-0"></div>

      <Header state="authenticated" />
      <main className="relative z-20">{children}</main>
    </div>
  );
}