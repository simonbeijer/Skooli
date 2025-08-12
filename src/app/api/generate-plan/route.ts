/**
 * Swedish Teacher Planner API Route - Gemini Integration
 * 
 * Production-ready API endpoint using @google/generative-ai package with
 * comprehensive Swedish educational requirements, Lgr22 compliance,
 * and robust error handling.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { findRelevantCurriculum } from "@/lib/curriculum-data";
import { verifyAuth } from "@/lib/auth";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GeminiAPIRequest {
  theme: string;
  grade: string;
  subjects: string; // Comma-separated string from form
  duration: string;
  notes?: string;
}

interface GeminiAPIResponse {
  success: boolean;
  plan?: string;
  error?: string;
  metadata?: {
    curriculumReferences: number;
    qualityScore: number;
    complianceIssues: string[];
  };
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const MIN_PLAN_LENGTH = 200;
const MIN_QUALITY_SCORE = 0.6;

// Swedish error messages
const ERROR_MESSAGES = {
  MISSING_API_KEY: "Serverkonfiguration saknas - Gemini API-nyckel inte konfigurerad",
  VALIDATION_FAILED: "Formulärdata är inkomplett eller felaktig",
  NETWORK_ERROR: "Ett tekniskt fel uppstod vid kommunikation med AI-tjänsten",
  QUOTA_EXCEEDED: "API-kvot överskriden - försök igen senare",
  EMPTY_RESPONSE: "Tom lektionsplan mottogs från AI-tjänsten",
  QUALITY_TOO_LOW: "Genererad lektionsplan uppfyller inte kvalitetskrav",
  INTERNAL_ERROR: "Ett oväntat serverfel uppstod"
} as const;

// Required Swedish educational elements for compliance
const REQUIRED_ELEMENTS = [
  "centralt innehåll",
  "förmågor", 
  "kunskapskrav",
  "lgr22",
  "läroplanen"
] as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function validateEnvironment(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.MISSING_API_KEY);
  }
  return apiKey;
}

function validateFormData(data: any): GeminiAPIRequest {
  const errors: string[] = [];

  if (!data.theme || typeof data.theme !== 'string' || data.theme.trim().length === 0) {
    errors.push("Tema måste anges");
  }
  
  if (!data.grade || typeof data.grade !== 'string' || data.grade.trim().length === 0) {
    errors.push("Årskurs måste anges");
  }
  
  if (!data.subjects || typeof data.subjects !== 'string' || data.subjects.trim().length === 0) {
    errors.push("Minst ett ämne måste väljas");
  }
  
  if (!data.duration || typeof data.duration !== 'string' || data.duration.trim().length === 0) {
    errors.push("Lektionslängd måste anges");
  }

  if (errors.length > 0) {
    throw new Error(`${ERROR_MESSAGES.VALIDATION_FAILED}: ${errors.join(", ")}`);
  }

  return {
    theme: data.theme.trim(),
    grade: data.grade.trim(),
    subjects: data.subjects.trim(),
    duration: data.duration.trim(),
    notes: data.notes?.trim() || undefined
  };
}

function validateCurriculumCompliance(plan: string): { 
  score: number; 
  issues: string[]; 
  hasRequiredElements: boolean; 
} {
  const issues: string[] = [];
  let score = 1.0;
  
  // Check for required Swedish educational elements
  const planLower = plan.toLowerCase();
  const missingElements = REQUIRED_ELEMENTS.filter(element => 
    !planLower.includes(element.toLowerCase())
  );

  if (missingElements.length > 0) {
    issues.push(`Saknar viktiga Lgr22-element: ${missingElements.join(", ")}`);
    score -= missingElements.length * 0.15;
  }

  // Check for proper Swedish pedagogical terminology
  const pedagogicalTerms = [
    "eleverna ska", "utveckla", "kunskap", "förmåga", "reflektion",
    "bedömning", "progression", "variation", "differentierng"
  ];
  
  const foundTerms = pedagogicalTerms.filter(term => 
    planLower.includes(term.toLowerCase())
  );
  
  if (foundTerms.length < 3) {
    issues.push("Begränsad användning av pedagogisk terminologi");
    score -= 0.1;
  }

  // Check minimum content length
  if (plan.length < MIN_PLAN_LENGTH) {
    issues.push(`Lektionsplanen är för kort (${plan.length} tecken, minimum ${MIN_PLAN_LENGTH})`);
    score -= 0.2;
  }

  // Check for structured format
  const hasHeaders = /#{1,3}\s/.test(plan);
  const hasBulletPoints = /[-*+]\s/.test(plan) || /\d+\.\s/.test(plan);
  
  if (!hasHeaders || !hasBulletPoints) {
    issues.push("Saknar tydlig struktur med rubriker och punktlistor");
    score -= 0.1;
  }

  return {
    score: Math.max(score, 0),
    issues,
    hasRequiredElements: missingElements.length === 0
  };
}

// ============================================================================
// PROMPT GENERATION
// ============================================================================

function generateEnhancedSwedishPrompt(
  formData: GeminiAPIRequest, 
  curriculumContext: string
): string {
  const subjectsArray = formData.subjects.split(',').map(s => s.trim()).filter(Boolean);
  const subjectList = subjectsArray.join(", ");

  return `Du är en erfaren svensk lärare som skapar detaljerade lektionsplaner enligt Lgr22. 

**UPPDRAG:**
Skapa en komplett lektionsplan för temat "${formData.theme}" för årskurs ${formData.grade} inom ämnena ${subjectList}. Lektionen ska vara ${formData.duration} lång.

**CURRICULAR KONTEXT:**
${curriculumContext}

**OBLIGATORISKA KRAV (Lgr22-compliance):**
- Referera explicit till centralt innehåll från Lgr22
- Specificera vilka förmågor som utvecklas
- Inkludera kunskapskrav och bedömningskriterier  
- Använd korrekt svensk pedagogisk terminologi
- Säkerställ progression och variation
- Inkludera differentiering för olika elevers behov

**STRUKTUR (använd markdown med emojis):**
# 📚 Lektionsplan: ${formData.theme}

## 🎯 Syfte och mål
- Koppling till Lgr22 centralt innehåll
- Förmågor som utvecklas
- Lärandemål för lektionen

## ⏰ Lektionsstruktur (${formData.duration})
- Detaljerad tidsindelning
- Aktiviteter med tydliga instruktioner
- Övergångar mellan aktiviteter

## 🎭 Aktiviteter och metoder
- Varierade arbetsformer
- Konkreta genomföranden
- Elevengagemang och delaktighet

## 🔍 Bedömning och uppföljning
- Formativ bedömning under lektionen
- Kunskapskrav som bedöms
- Dokumentation och återkoppling

## 📖 Material och resurser
- Konkreta material som behövs
- Digitala verktyg om tillämpligt
- Förberedelser för läraren

## 🌟 Differentiering och anpassningar
- Stöd för elever som behöver extra hjälp
- Utmaningar för elever som behöver fördjupning
- Språkstöd och tillgänglighet

${formData.notes ? `\n**SÄRSKILDA ÖNSKEMÅL:**\n${formData.notes}` : ''}

**KVALITETSKRAV:**
- Använd konkreta svenska exempel och referenser
- Inkludera praktiska genomföranden, inte bara teorier
- Säkerställ att alla aktiviteter har tydliga instruktioner
- Balansera individuellt arbete, par- och grupparbete
- Föreslå realistiska material som finns på svenska skolor
- Anpassa språknivå och innehåll för vald årskurs

Skapa en inspirerande och genomförbar lektionsplan som följer svensk skolkultur och Lgr22!`;
}

// ============================================================================
// GEMINI API INTERACTION
// ============================================================================

async function generatePlanWithGemini(prompt: string, apiKey: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedPlan = response.text();
    
    if (!generatedPlan || generatedPlan.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.EMPTY_RESPONSE);
    }

    return generatedPlan.trim();
    
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Handle specific API errors
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new Error(ERROR_MESSAGES.QUOTA_EXCEEDED);
    }
    
    if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    
    throw new Error(`${ERROR_MESSAGES.NETWORK_ERROR}: ${error.message || 'Okänt fel'}`);
  }
}

// ============================================================================
// RETRY LOGIC WITH QUALITY VALIDATION
// ============================================================================

async function generatePlanWithRetries(
  formData: GeminiAPIRequest, 
  curriculumContext: string, 
  apiKey: string
): Promise<{ plan: string; metadata: GeminiAPIResponse['metadata'] }> {
  const prompt = generateEnhancedSwedishPrompt(formData, curriculumContext);
  let bestAttempt: { plan: string; score: number; issues: string[] } | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Försök ${attempt}/${MAX_RETRIES}: Genererar lektionsplan...`);
      
      const plan = await generatePlanWithGemini(prompt, apiKey);
      const validation = validateCurriculumCompliance(plan);
      
      console.log(`Kvalitetspoäng för försök ${attempt}: ${validation.score}`);
      
      // Track best attempt
      if (!bestAttempt || validation.score > bestAttempt.score) {
        bestAttempt = { plan, score: validation.score, issues: validation.issues };
      }
      
      // Check if this attempt meets quality requirements
      if (validation.score >= MIN_QUALITY_SCORE && validation.hasRequiredElements) {
        console.log(`Kvalitetskrav uppfyllda på försök ${attempt}`);
        return {
          plan,
          metadata: {
            curriculumReferences: (curriculumContext.match(/Lgr22/g) || []).length,
            qualityScore: Math.round(validation.score * 100) / 100,
            complianceIssues: validation.issues
          }
        };
      }
      
      if (attempt < MAX_RETRIES) {
        console.log(`Kvalitet för låg (${validation.score}), försöker igen...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
      
    } catch (error: any) {
      console.error(`Försök ${attempt} misslyckades:`, error.message);
      
      if (attempt === MAX_RETRIES) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  
  // If we get here, all attempts failed quality requirements but we have a best attempt
  if (bestAttempt) {
    console.log(`Använder bästa försök med poäng: ${bestAttempt.score}`);
    return {
      plan: bestAttempt.plan,
      metadata: {
        curriculumReferences: (curriculumContext.match(/Lgr22/g) || []).length,
        qualityScore: Math.round(bestAttempt.score * 100) / 100,
        complianceIssues: bestAttempt.issues
      }
    };
  }
  
  throw new Error(ERROR_MESSAGES.QUALITY_TOO_LOW);
}

// ============================================================================
// MAIN API ENDPOINT
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<GeminiAPIResponse>> {
  try {
    console.log('=== Swedish Teacher Planner API - Genererar lektionsplan ===');
    
    // Authentication validation - ensure user is logged in
    const token = request.cookies.get('token')?.value;
    if (!token) {
      console.warn('❌ Unauthorized API request - no authentication token');
      return NextResponse.json({
        success: false,
        error: "Autentisering krävs för att använda denna tjänst",
        metadata: {
          curriculumReferences: 0,
          qualityScore: 0,
          complianceIssues: ["Autentiseringsfel"]
        }
      }, { status: 401 });
    }

    try {
      const payload = await verifyAuth(token);
      console.log(`✅ Authenticated user: ${payload.email} (${payload.id})`);
    } catch (authError) {
      console.warn('❌ Invalid authentication token:', authError);
      return NextResponse.json({
        success: false,
        error: "Ogiltig autentisering - logga in igen",
        metadata: {
          curriculumReferences: 0,
          qualityScore: 0,
          complianceIssues: ["Autentiseringsfel"]
        }
      }, { status: 401 });
    }
    
    // Environment validation
    const apiKey = validateEnvironment();
    
    // Parse and validate request body
    const body = await request.json();
    const formData = validateFormData(body);
    
    console.log(`Tema: ${formData.theme}, Årskurs: ${formData.grade}, Ämnen: ${formData.subjects}`);
    
    // Parse subjects array
    const subjectsArray = formData.subjects.split(',').map(s => s.trim()).filter(Boolean);
    
    // Find relevant curriculum content
    console.log('Söker relevant curricular innehåll...');
    const curriculumResult = findRelevantCurriculum(formData.theme, formData.grade, subjectsArray);
    
    console.log(`Hittade ${curriculumResult.documents.length} relevanta curriculum-dokument`);
    console.log(`Relevanspoäng: ${curriculumResult.relevanceScore}`);
    
    // Prepare curriculum context for prompt
    const curriculumContext = curriculumResult.documents.length > 0
      ? curriculumResult.documents.map(doc => 
          `**${doc.subject} (${doc.grades.join(', ')}):**\n${doc.content}\n**Aktiviteter:** ${doc.activities.join(', ')}\n**Källa:** ${doc.source}`
        ).join('\n\n')
      : `**OBS:** Ingen specifik curriculum hittades för "${formData.theme}" i årskurs ${formData.grade}. Använd generella Lgr22-riktlinjer för ${subjectsArray.join(', ')}.`;
    
    // Generate lesson plan with retries and quality validation
    const result = await generatePlanWithRetries(formData, curriculumContext, apiKey);
    
    console.log('✅ Lektionsplan genererad framgångsrikt');
    console.log(`Kvalitetspoäng: ${result.metadata?.qualityScore}`);
    console.log(`Curriculum-referenser: ${result.metadata?.curriculumReferences}`);
    
    return NextResponse.json({
      success: true,
      plan: result.plan,
      metadata: result.metadata || {
      curriculumReferences: 0,
      qualityScore: 0,
      complianceIssues: []
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('❌ Fel vid generering av lektionsplan:', error);
    
    // Log error details for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    console.error('Error details:', errorDetails);
    
    // Return user-friendly error message
    return NextResponse.json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      metadata: {
        curriculumReferences: 0,
        qualityScore: 0,
        complianceIssues: ["Fel vid generering"]
      }
    }, { status: 500 });
  }
}

// ============================================================================
// METHOD NOT ALLOWED HANDLERS
// ============================================================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false,
      error: "Metoden GET stöds inte. Använd POST för att generera lektionsplaner.",
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false,
      error: "Metoden PUT stöds inte. Använd POST för att generera lektionsplaner.",
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false,
      error: "Metoden DELETE stöds inte. Använd POST för att generera lektionsplaner.",
    },
    { status: 405 }
  );
}