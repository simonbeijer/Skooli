"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../components/button";
import InputField from "../../components/inputField";
import TextAreaField from "../../components/textAreaField";
import FormSelect from "../../components/formSelect";
import Spinner from "../../components/spinner";

export default function GeneratePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    theme: '',
    grade: '',
    subjects: '',
    duration: '',
    notes: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const gradeOptions = [
    { value: "forskoleklass", label: "Förskoleklass" },
    { value: "1", label: "Årskurs 1" },
    { value: "2", label: "Årskurs 2" },
    { value: "3", label: "Årskurs 3" },
    { value: "4", label: "Årskurs 4" },
    { value: "5", label: "Årskurs 5" },
    { value: "6", label: "Årskurs 6" }
  ];

  const durationOptions = [
    { value: "1-vecka", label: "1 vecka" },
    { value: "2-veckor", label: "2 veckor" },
    { value: "3-veckor", label: "3 veckor" },
    { value: "1-manad", label: "1 månad" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous API errors
    setApiError('');
    setIsGenerating(true);
    
    try {
      // Real API call to /api/generate-plan
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          theme: formData.theme,
          grade: formData.grade,
          subjects: formData.subjects,
          duration: formData.duration,
          notes: formData.notes || undefined
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Ett okänt fel uppstod från AI-tjänsten');
      }
      
      if (!data.plan?.trim()) {
        throw new Error('Tom lektionsplan mottogs från AI-tjänsten');
      }
      
      // Store both form data and generated plan
      const enhancedData = {
        ...formData,
        generatedPlan: data.plan,
        timestamp: new Date().toISOString(),
        curriculumReferences: data.metadata?.curriculumReferences || 0
      };
      
      localStorage.setItem('lessonPlanData', JSON.stringify(enhancedData));
      
      router.push('/results');
      
    } catch (error) {
      console.error('API Generation Error:', error);
      
      let errorMessage = 'Ett oväntat fel inträffade';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Nätverksfel - kontrollera din internetanslutning och försök igen';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Autentiseringsfel - kontakta support om problemet kvarstår';
        } else if (error.message.includes('HTTP 429')) {
          errorMessage = 'För många förfrågningar - vänta en stund och försök igen';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Serverfel - försök igen om några minuter';
        } else if (error.message.includes('AI-tjänsten') || error.message.includes('Tom lektionsplan')) {
          errorMessage = error.message;
        } else {
          errorMessage = 'Tekniskt fel vid lektionsplaneringen - försök igen';
        }
      }
      
      // Show user-friendly error (preserve existing error handling pattern)
      setApiError(errorMessage);
      
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear API error when user starts typing
    if (apiError) setApiError('');
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] relative z-10">
        <div className="text-center space-y-6">
          <Spinner size="lg" />
          <div className="space-y-2">
            <h2 className="text-2xl font-playfair font-bold text-[#1C1C1C]">Skapar Din Lektionsplan...</h2>
            <p className="text-[#333]">AI:n analyserar Läroplanen och skapar din plan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back Navigation - moved to right */}
      <div className="relative z-10 mt-8 mb-2">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-end">
          <Link href="/dashboard" className="flex items-center space-x-2 text-[#333] hover:text-[#3E8E7E] transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Tillbaka</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        <div className="bg-white rounded-3xl p-8 border border-[#E6F2F1]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-playfair font-bold text-[#1C1C1C] mb-4">
              Skapa Din Lektionsplan
            </h1>
            <p className="text-[#333]">
              Fyll i formuläret nedan så skapar vår AI en komplett lektionsplan enligt Läroplanen
            </p>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{apiError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                name="theme"
                label="Tema"
                placeholder="t.ex. Skogens Djur, Rymden, Vatten..."
                value={formData.theme}
                onChange={(value) => handleInputChange('theme', value)}
                required
              />

              <FormSelect
                label="Årskurs"
                value={formData.grade}
                onValueChange={(value) => handleInputChange('grade', value)}
                options={gradeOptions}
                placeholder="Välj årskurs"
                required
              />

              <InputField
                name="subjects"
                label="Ämnen"
                placeholder="t.ex. Matematik + Svenska, NO, SO..."
                value={formData.subjects}
                onChange={(value) => handleInputChange('subjects', value)}
                required
              />

              <FormSelect
                label="Längd"
                value={formData.duration}
                onValueChange={(value) => handleInputChange('duration', value)}
                options={durationOptions}
                placeholder="Välj längd"
                required
              />
            </div>

            <TextAreaField
              name="notes"
              label="Ytterligare Önskemål (valfritt)"
              placeholder="Beskriv eventuella specifika önskemål eller fokusområden..."
              value={formData.notes}
              onChange={(value) => handleInputChange('notes', value)}
              rows={4}
            />

            <div className="text-center pt-4">
              <Button 
                type="submit" 
                text="Generera Lektionsplan"
                variant="primary"
                size="default"
                className={`px-8 py-3 rounded-xl ${
                  (!formData.theme || !formData.grade || !formData.subjects || !formData.duration) 
                    ? 'opacity-60 cursor-not-allowed bg-[#3E8E7E]/30 hover:bg-[#3E8E7E]/30' 
                    : ''
                }`}
                disabled={!formData.theme || !formData.grade || !formData.subjects || !formData.duration}
              />
            </div>
          </form>
        </div>
      </main>
    </>
  );
}