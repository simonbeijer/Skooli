PRD: Swedish Curriculum RAG Planner 🎯
Ultra-focused MVP using Gemini 2.0 Flash + Swedish curriculum RAG

PROJECT NAME Skooli

🧠 Project Summary
Problem: Swedish teachers spend 3-5 hours/week creating curriculum-compliant lesson plans
Solution: Form → Gemini AI + Swedish curriculum docs → Formatted lesson plan to copy
Tech: Your existing Next.js template + Gemini 2.0 Flash API
Scope: Login → Form → Generate → Copy (nothing else)

✅ What You're Building (5 Files)
1. Curriculum Data Storage
File: lib/curriculum-data.js
javascriptexport const curriculumDocs = [
  {
    id: 1,
    subject: "Matematik", 
    grades: ["1-3"],
    keywords: ["räkna", "djur", "former", "mäta"],
    content: "Eleverna ska utveckla förmåga att använda matematik för att kommunicera...",
    source: "Lgr22 - Matematik årskurs 1-3"
  }
  // 15-20 Swedish curriculum snippets from your documents
];

export function searchCurriculum(theme, grade, subjects) {
  // Simple keyword matching - finds relevant docs
}
2. Planning Form
File: components/PlanningForm.js
javascript// Required fields:
- theme: "Djur", "Rymden", "Miljö" (text input)
- gradeLevel: "1-3", "4-6", "7-9" (dropdown)  
- subjects: "Matematik, Svenska, NO" (text input)
- duration: "1 vecka", "2 veckor", "1 månad" (dropdown)

// Uses your existing Input/Button components
// Shows loading state during generation
3. RAG Engine
File: lib/rag-engine.js
javascriptexport function buildContext(formData) {
  // 1. Find relevant curriculum docs
  const docs = searchCurriculum(formData.theme, formData.gradeLevel, formData.subjects);
  
  // 2. Build Gemini prompt with Swedish curriculum context
  const prompt = `Du är expert på svenska läroplanen. Använd följande kurriculum:
${docs.map(d => d.content).join('\n')}

Skapa en tematisk läroplan för:
- Tema: ${formData.theme}
- Årskurs: ${formData.gradeLevel}  
- Ämnen: ${formData.subjects}
- Tid: ${formData.duration}

Inkludera läroplanshänvisningar och konkreta aktiviteter.`;
  
  return { prompt, sources: docs };
}
4. Gemini API Route
File: app/api/generate-plan/route.js
javascriptimport { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { buildContext } from "@/lib/rag-engine";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // RAG: Build context with curriculum docs
    const { prompt } = buildContext(formData);
    
    // Gemini generation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash"
    });
    
    const result = await model.generateContent(prompt);
    const plan = result.response.text();
    
    return NextResponse.json({ 
      plan,
      metadata: { theme: formData.theme, grade: formData.gradeLevel }
    });
  } catch (error) {
    console.error('Generation failed:', error);
    return NextResponse.json(
      { error: 'Kunde inte generera läroplan' }, 
      { status: 500 }
    );
  }
}
5. Dashboard Integration
File: app/dashboard/page.js (modify existing)
javascript// Add planning interface to existing dashboard
const [generatedPlan, setGeneratedPlan] = useState('');
const [loading, setLoading] = useState(false);

const handleGenerate = async (formData) => {
  setLoading(true);
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    setGeneratedPlan(data.plan);
  } catch (error) {
    alert('Något gick fel');
  } finally {
    setLoading(false);
  }
};

// UI: Form + Results with copy button

🎯 Your Key Requirements (All Included)
✅ Uses existing Next.js template - Auth, components, structure
✅ Gemini 2.0 Flash - Your chosen AI model
✅ Swedish curriculum RAG - Official Skolverket documents
✅ Simple file-based RAG - No vector database complexity
✅ Ultra-minimal scope - Form → Generate → Copy only
✅ No database changes - Uses existing auth system
✅ Real curriculum compliance - Not made-up content
✅ Bear minimum MVP - Teachers copy/edit on their own

⚡ Implementation Order
Day 1-2: Create curriculum-data.js with Swedish curriculum snippets
Day 3: Build PlanningForm.js component
Day 4: Create rag-engine.js with search + context building
Day 5: Build API route with Gemini integration
Day 6: Wire everything to dashboard page
Day 7: Add loading states, error handling, copy button

✅ Success Definition
MVP is done when:

Teacher logs in ✅ (existing)
Fills form: "Djur, 1-3, Matematik+Svenska, 2 veckor"
Clicks generate → sees loading state
Gets formatted Swedish lesson plan with curriculum refs
Clicks copy button → can paste in Word/email
No crashes, < 30 second generation time


🔧 Environment Setup
Required:

GEMINI_API_KEY in your .env file
@google/generative-ai npm packageQuick Implementation Roadmap 🚀
7-day sprint to working RAG lesson planner

📅 Day-by-Day Implementation
Day 1: Foundation Setup
Goal: Get curriculum data ready
□ Create lib/curriculum-data.js
□ Add 15-20 Swedish curriculum snippets from your documents
□ Build simple searchCurriculum() function
□ Test search with console.log("Djur" → returns animal-related docs)
Files: lib/curriculum-data.js ✨

Day 2: Planning Form Component
Goal: Teacher input interface
□ Create components/PlanningForm.js
□ Use existing template Input/Button components
□ 4 fields: theme, gradeLevel, subjects, duration
□ Add form validation (required fields)
□ Test form renders and captures data
Files: components/PlanningForm.js ✨

Day 3: RAG Engine
Goal: Connect curriculum search to AI prompts
□ Create lib/rag-engine.js  
□ Build buildContext(formData) function
□ Test: form data → finds curriculum docs → builds Swedish prompt
□ Console.log the full prompt to verify RAG context
Files: lib/rag-engine.js ✨

Day 4: Gemini API Integration
Goal: Get AI generating plans
□ npm install @google/generative-ai
□ Add GEMINI_API_KEY to .env
□ Create app/api/generate-plan/route.js
□ Test API with Postman/curl (hardcode simple request)
□ Verify Gemini returns Swedish lesson plan text
Files: app/api/generate-plan/route.js ✨

Day 5: Dashboard Integration
Goal: Wire everything together
□ Modify app/dashboard/page.js
□ Add PlanningForm component
□ Add form submission handler
□ Connect to API route
□ Display generated plan in simple text block
□ Test complete flow: form → API → result
Files: app/dashboard/page.js (modify)

Day 6: Polish & Error Handling
Goal: Make it production-ready
□ Add loading spinner during generation
□ Handle API errors gracefully  
□ Add copy-to-clipboard button
□ Test on mobile device
□ Verify curriculum references appear in plans
Files: Polish existing components

Day 7: Testing & Validation
Goal: Ensure it actually works
□ Test 5+ different themes/grades
□ Verify generation time < 30 seconds
□ Check curriculum compliance in outputs
□ Test copy/paste functionality
□ Get 1-2 teachers to test if possible
Deliverable: Working MVP! 🎉

🔧 Technical Checkpoints
Day 2 Check:
npm run dev → dashboard shows planning form ✅
Day 4 Check:
API call returns Swedish lesson plan text ✅
Day 5 Check:
Full flow works: form → loading → result ✅
Day 7 Check:
Teacher can generate usable lesson plan in 2 minutes ✅

⚡ Quick Wins
Use existing template components:

Button, Input, Loading spinner already built
Authentication already working
Dashboard layout ready

Start with hardcoded data:

Day 1: Just get curriculum snippets working
Day 4: Test API with simple hardcoded prompt first
Polish later, get core loop working first

Focus on Swedish content:

All prompts in Swedish
Curriculum references included
Grade-appropriate language

