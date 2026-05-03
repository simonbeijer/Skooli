"use client";

import { useState, useEffect, useMemo } from "react";
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

  // Parse lesson plan markdown into H1 title + H2-keyed sections
  const parsedPlan = useMemo(() => {
    const lines = lessonPlan.split("\n");
    let h1: string | null = null;
    const sections: { title: string; body: string }[] = [];
    let current: { title: string; body: string } | null = null;
    for (const line of lines) {
      if (line.startsWith("# ")) {
        h1 = line.slice(2).trim();
      } else if (line.startsWith("## ")) {
        if (current) sections.push(current);
        current = { title: line.slice(3).trim(), body: "" };
      } else if (current) {
        current.body += line + "\n";
      }
    }
    if (current) sections.push(current);
    return { h1, sections };
  }, [lessonPlan]);

  const isOpenByDefault = (title: string) => {
    const t = title.toLowerCase();
    return t.includes("arbetsgång") || t.includes("översikt");
  };

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

        {/* Lesson Plan Content — accordion sections */}
        <div className="bg-white rounded-2xl p-10 shadow-lg border border-primary/20 border-t-4 border-t-primary border-b-4 border-b-primary">
          {parsedPlan.h1 && (
            <h1 className="text-2xl font-bold text-foreground mb-8">{parsedPlan.h1}</h1>
          )}
          <div className="divide-y divide-muted">
            {parsedPlan.sections.map((section, i) => (
              <details
                key={i}
                open={isOpenByDefault(section.title)}
                className="group py-4 first:pt-0 last:pb-0 rounded-2xl border border-primary/20 border-b-4 border-b-primary p-4 mb-4"
              >
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-4 py-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
                  <span>{section.title}</span>
                  <svg
                    className="w-5 h-5 transition-transform group-open:rotate-180 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="pt-4 text-foreground leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h3: ({ children }) => <h3 className="text-lg font-bold text-foreground mt-4 mb-3">{children}</h3>,
                      p: ({ children }) => <p className="text-foreground mb-4 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="mb-6 space-y-2 pl-6">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-6 space-y-2 pl-6">{children}</ol>,
                      li: ({ children }) => <li className="text-foreground list-disc">{children}</li>,
                      strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                      hr: () => null,
                    }}
                  >
                    {section.body}
                  </ReactMarkdown>
                </div>
              </details>
            ))}
          </div>
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
