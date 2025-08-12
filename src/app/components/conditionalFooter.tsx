"use client";

import { usePathname } from "next/navigation";

interface ConditionalFooterProps {
  hiddenPaths?: string[];
  className?: string;
  companyName?: string;
  year?: number;
}

const ConditionalFooter = ({ 
  hiddenPaths = ["/login"],
  className = '',
  companyName = 'Skooli',
  year = new Date().getFullYear()
}: ConditionalFooterProps) => {
  const pathname = usePathname();
  
  // Hide footer on specified paths
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  return (
    <footer className={`flex justify-center items-center h-12 bg-[#F0F7F6] mt-auto ${className}`.trim()}>
      <p className="text-sm font-inter text-[#333]/60">
        © {year} {companyName}
      </p>
    </footer>
  );
};

export default ConditionalFooter;