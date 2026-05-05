"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../components/button";
import ReactMarkdown from "react-markdown";

// Enhanced data structure interface
interface EnhancedLessonPlanData {
  theme: string;
  grade: string;
  subjects: string;
  lessonCount: number;
  notes?: string;
  generatedPlan: string;
  timestamp: string;
  curriculumReferences: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EnhancedLessonPlanData | null>(null);
  const [lessonPlan, setLessonPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadLessonPlan = () => {
      try {
        const data = localStorage.getItem("lessonPlanData");

        if (!data) {
          setError("Ingen lektionsplan hittades i lagringsminnet.");
          setIsLoading(false);
          return;
        }

        const parsedData: EnhancedLessonPlanData = JSON.parse(data);

        // Validate required fields
        if (
          !parsedData.generatedPlan ||
          typeof parsedData.generatedPlan !== "string" ||
          parsedData.generatedPlan.trim() === ""
        ) {
          setError(
            "Ingen AI-genererad lektionsplan hittades. Planen verkar vara tom eller skadad."
          );
          // Clean up corrupted data
          localStorage.removeItem("lessonPlanData");
          setIsLoading(false);
          return;
        }

        // Validate data structure integrity
        if (!parsedData.theme || !parsedData.grade || !parsedData.subjects || !parsedData.lessonCount) {
          setError("Lektionsplanens data är ofullständig eller skadad.");
          localStorage.removeItem("lessonPlanData");
          setIsLoading(false);
          return;
        }

        // Successfully loaded valid data
        setFormData(parsedData);
        setLessonPlan(parsedData.generatedPlan);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading lesson plan data:", err);
        setError(
          "Kunde inte läsa lektionsplanens data. Data kan vara korrupt."
        );
        // Clean up corrupted data
        localStorage.removeItem("lessonPlanData");
        setIsLoading(false);
      }
    };

    loadLessonPlan();
  }, []);

  // Convert markdown to clean plain text
  const stripMarkdown = (text: string) => {
    return text
      .replace(/#{1,6}\s+/g, '') // Remove # headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links [text](url)
      .replace(/`(.*?)`/g, '$1') // Remove `code`
      .replace(/^\s*[-*+]\s+/gm, '• ') // Convert - to bullets
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list numbers
      .trim();
  };

  const copyToClipboard = async () => {
    if (!lessonPlan) {
      console.error("No lesson plan content to copy");
      return;
    }

    try {
      // Convert markdown to clean text
      const cleanText = stripMarkdown(lessonPlan);
      
      // Modern clipboard API with fallback
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(cleanText);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = cleanText;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy lesson plan text:", err);
      // Could add error state here if needed
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-grey font-medium">Laddar lektionsplan...</p>
        </div>
      </div>
    );
  }

  // Error state - No AI content or corrupted data
  if (error || !lessonPlan || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center bg-red-50 p-8 rounded-2xl max-w-md border border-red-200">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-playfair font-bold text-red-800 mb-4">
            Ingen lektionsplan att visa
          </h2>
          <p className="text-red-700 mb-6 leading-relaxed">
            {error || "Ingen AI-genererad lektionsplan hittades."}
          </p>
          <Button
            callBack={() => router.push("/generate")}
            text="Tillbaka till formulär"
            variant="primary"
            className="bg-primary hover:bg-primary-dark border-primary"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back Navigation - moved to right */}
      <div className="relative z-10 mt-8 mb-2">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-end">
          <Link
            href="/generate"
            className="flex items-center space-x-2 text-grey hover:text-primary transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Skapa Ny Plan</span>
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        {/* Success Message */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-muted flex items-center space-x-4">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-playfair font-bold text-foreground">
              Din Lektionsplan är Klar!
            </h2>
            <p className="text-grey">
              Genererad enligt Läroplanen för • {formData.theme} • åk {formData.grade} • {formData.subjects} • {formData.lessonCount === 1 ? "1 lektion" : `${formData.lessonCount} lektioner`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            callBack={copyToClipboard}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {copied ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              )}
            </svg>
            <span>{copied ? "Kopierat!" : "Kopiera Text"}</span>
          </Button>

          <Button variant="outline" className="flex items-center space-x-2" callBack={() => alert('PDF download not yet implemented')}>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Ladda ner PDF</span>
          </Button>
        </div>

        {/* Lesson Plan Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-white/50 shadow-lg">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-playfair font-bold text-foreground mb-4 first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-playfair font-bold text-foreground mt-10 mb-4 pb-2 border-b border-muted">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-primary mt-6 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-foreground mb-4 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => <ul className="mb-6 space-y-2 pl-6 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="mb-6 space-y-2 pl-6 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="text-foreground">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              em: ({ children }) => <em className="italic text-primary">{children}</em>,
              hr: () => <hr className="my-8 border-muted" />,
            }}
          >
            {lessonPlan}
          </ReactMarkdown>
        </div>

        {/* Footer Actions */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-grey">
            Behöver du göra ändringar? Kopiera texten och redigera i ditt
            favoritprogram.
          </p>
          <Link href="/generate">
            <Button text="Skapa Ny Lektionsplan" variant="secondary" />
          </Link>
        </div>
      </main>
    </>
  );
}
