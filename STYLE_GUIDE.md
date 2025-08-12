# 🎨 Skooli Design System & Style Guide

**For Claude Code AI Agent**

This style guide documents the implemented design patterns across Skooli's UI, focusing on the educational/nature-centric Swedish lesson planner theme. Use this guide to maintain consistency when implementing new pages or components.

---

## 🎯 DESIGN PHILOSOPHY

### Core Theme: Educational Nature Experience
- **Educational Focus**: Learning through exploration and discovery
- **Nature-Centric**: Wildlife, forest scenes, wholesome outdoor elements  
- **Swedish Educational Context**: Lesson planning following "Läroplanen"
- **Friendly & Approachable**: Youthful, expressive, relatable interface

### Visual Principles
- **Clean & Minimalist**: Generous whitespace, uncluttered layouts
- **Muted Pastels**: Soft greens and earth tones for soothing experience
- **Glass Morphism**: Subtle transparency effects with backdrop blur
- **Flat Illustrations**: Solid colors, no gradients in illustrations
- **Abstract Shapes**: Soft circular background elements for depth

---

## 🌱 EMOTIONAL DESIGN LANGUAGE

### Learning Atmosphere
- **Calm Discovery**: The muted greens and soft shapes create a peaceful learning environment that reduces cognitive stress while planning lessons
- **Natural Growth**: Design elements mirror organic growth patterns, reinforcing the educational journey metaphor of students and teachers growing together
- **Swedish Hygge**: Clean, comfortable spaces that feel like cozy study nooks in Nordic nature, promoting focus and well-being
- **Confident Exploration**: Visual hierarchy guides teachers through complex lesson planning without overwhelming them with too many choices at once

### User Emotional Journey
- **Entry**: Welcomed by friendly, nature-inspired visuals that feel approachable rather than intimidating or corporate
- **Planning**: Supported by clear, uncluttered forms that build confidence in lesson creation process
- **Creation**: Empowered by smooth interactions and immediate feedback that make AI collaboration feel natural
- **Achievement**: Celebrated with success states that feel rewarding and professional, validating the teacher's expertise

### Trust & Professional Confidence  
- **Educator Partnership**: Interface positions itself as a knowledgeable assistant that respects teacher expertise
- **Reliable Consistency**: Predictable patterns build trust that the tool will work as expected every time
- **Gentle Guidance**: Helpful without being prescriptive, supporting teacher creativity rather than replacing it

---

## 📖 VISUAL STORYTELLING & METAPHORS

### The Forest Classroom Metaphor
- **Trees as Knowledge Growth**: Different tree heights represent various learning levels and the organic growth of student understanding
- **Circular Shapes as Organic Learning**: Soft, natural forms versus rigid institutional boxes, suggesting learning as a natural, flowing process
- **Glass Morphism as Educational Transparency**: Clear, honest educational tools without hidden complexity or bureaucratic barriers
- **Layered Backgrounds as Learning Depth**: Multiple visual layers represent the depth and richness of educational content and understanding

### Swedish Educational Values Reflected
- **Lagom (Balance)**: Not too much, not too little - perfect amount of visual elements that inform without overwhelming
- **Trygghet (Security)**: Predictable, safe interface patterns that build user confidence and reduce anxiety about technology
- **Allemansrätt (Right to Roam)**: Free exploration of educational tools and content, encouraging teachers to discover features organically
- **Folkhemmet (People's Home)**: Inclusive design that welcomes all educators regardless of technical experience

### Nature-Education Connection
- **Organic Illustrations**: Simple forest animals and trees connect lesson planning to the natural curiosity children have about their world
- **Seasonal Metaphors**: Growth cycles reflected in user journey from planning through implementation to reflection
- **Ecosystem Thinking**: Individual components work together harmoniously, like elements in a healthy forest ecosystem

---

## 🤝 INCLUSIVE DESIGN PHILOSOPHY

### Cognitive Accessibility
- **Progressive Disclosure**: Information revealed at comfortable paces to prevent overwhelm, especially important for busy teachers with limited planning time
- **Visual Breathing Room**: Generous spacing reduces cognitive load for neurodiverse users and supports focus during complex planning tasks
- **Consistent Patterns**: Predictable interactions build confidence for all learning styles and technical comfort levels
- **Multi-Modal Feedback**: Visual, textual, and interactive confirmations support different processing preferences and abilities

### Cultural & Professional Sensitivity
- **Swedish Educational Context**: Design patterns that feel familiar to Swedish educational culture and administrative workflows
- **Universal Learning Metaphors**: Visual elements that transcend language barriers while respecting local educational traditions
- **Teacher Empowerment**: Interface that respects educator expertise while providing helpful structural support
- **Diverse Learning Needs**: Acknowledging that teachers serve students with varied abilities and learning styles

### Technical Inclusion
- **Graceful Complexity**: Advanced features available but not required for basic functionality
- **Error Recovery**: Gentle guidance that assumes positive intent and provides clear paths forward
- **Multiple Entry Points**: Various ways to accomplish tasks to accommodate different working styles

---

## ✨ MICRO-INTERACTION PHILOSOPHY

### Purposeful Animations
- **Gentle Transitions**: 200ms timing feels natural and breathing-like, avoiding jarring changes that disrupt focus
- **Hover States**: Subtle color changes invite exploration without being distracting during concentrated work
- **Loading States**: Progress indicators that feel encouraging rather than stressful, acknowledging the AI is working thoughtfully
- **Success Feedback**: Celebrations that feel earned and professional, validating successful lesson creation

### Interaction Personality
- **Helpful Teaching Assistant**: Interface responds like a knowledgeable but patient colleague who understands education
- **Encouraging Feedback**: Positive reinforcement in form validation and success states that builds confidence
- **Gentle Corrections**: Error states that guide rather than scold, assuming teachers want to succeed
- **Respectful Pacing**: No rushed interactions; teachers can take time to think and plan thoughtfully

### Emotional Micro-Moments
- **Anticipation**: Smooth transitions that prepare users for what's coming next
- **Achievement**: Subtle celebrations when forms are completed or lessons generated successfully
- **Security**: Consistent feedback that confirms actions have been saved and processed
- **Discovery**: Delightful moments that reveal new capabilities without overwhelming the workflow

---

## 🎨 COLOR PALETTE

### Primary Colors
```css
--primary-color: #3E8E7E;        /* Main brand green */
--secondary-color: #88C9BF;      /* Light green accent */
--accent-green: #A4D4AE;         /* Softer green accent */
```

### Background & Layout
```css
--background: #F0F7F6;           /* Main page background */
--background-muted: #E6F2F1;     /* Subtle background variation */
--border-color: #E6F2F1;         /* Consistent border color */
```

### Text Colors
```css
--text-primary: #1C1C1C;         /* Main text */
--text-secondary: #333;          /* Secondary text */
```

### Glass Morphism Effects
```css
--glass-bg: rgba(255, 255, 255, 0.8);     /* Semi-transparent white */
--glass-border: rgba(255, 255, 255, 0.5); /* Border for glass cards */
```

### Abstract Background Shapes
```css
--shape-1: #E4F1EF;  /* Top-left circles */
--shape-2: #D8EDE9;  /* Top-right circles */
--shape-3: #E8F4F1;  /* Mid-left circles */
--shape-4: #DCF0EC;  /* Bottom-right circles */
```

---

## 📝 TYPOGRAPHY

### Font Stack
```css
/* Primary Font - Body Text */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Accent Font - Headings */
font-family: 'Playfair Display', serif;
```

### Font Classes
```css
.font-inter      /* Clean, readable body text */
.font-playfair   /* Elegant headings and titles */
```

### Heading Hierarchy
- **H1**: `text-5xl lg:text-6xl font-playfair font-bold` - Hero titles
- **H2**: `text-3xl font-playfair font-bold` - Section headings  
- **H3**: `text-xl font-semibold` - Subsection headings

---

## 🏗️ LAYOUT PATTERNS

### Page Structure Template
```jsx
<div className="min-h-screen bg-[#F0F7F6] relative overflow-x-hidden">
  {/* Abstract Background Shapes - MUST stay behind content */}
  <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#E4F1EF] rounded-full opacity-60 sm:opacity-90 z-0"></div>
  <div className="absolute top-[-50px] right-[-150px] w-[350px] h-[350px] bg-[#D8EDE9] rounded-full opacity-60 sm:opacity-90 z-0"></div>
  
  {/* Navigation - Above background, below main content */}
  <nav className="relative z-10 mt-12 mb-4">
    {/* Navigation content */}
  </nav>
  
  {/* Main Content - Highest priority, always visible */}
  <main className="relative z-20 max-w-6xl mx-auto px-6 py-8">
    {/* Page content */}
  </main>
</div>
```

### Z-Index Hierarchy Rules
**Critical for preventing background overlap:**
- Background shapes: `z-0` (lowest priority)
- Navigation: `z-10` (medium priority) 
- Main content: `z-20` (highest priority)
- Modals/dropdowns: `z-30+` (when needed)

### Container Widths
- **Homepage**: `max-w-6xl mx-auto` (wider for hero section)
- **Form Pages**: `max-w-4xl mx-auto` (narrower for better form UX)
- **Content Pages**: `max-w-4xl mx-auto` (readable content width)

### Glass Card Pattern
```tsx
<div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg relative z-20">
  {/* Card content */}
</div>
```

---

## 🧩 NAVIGATION PATTERNS

### Brand Logo Pattern
```tsx
<div className="flex items-center space-x-3">
  <div className="w-10 h-10 bg-[#3E8E7E] rounded-xl flex items-center justify-center">
    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  </div>
  <span className="text-2xl font-playfair font-bold text-[#1C1C1C]">Skooli</span>
</div>
```

### Authenticated Header Integration
**File**: `/src/app/components/header.tsx`

When users are logged in, integrate Swedish Teacher Planner navigation into the existing header component:

```tsx
// Enhanced header with Swedish navbar elements
const navigation = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Skapa Lektion', href: '/generate', active: pathname === '/generate' },
  { label: 'Mina Planer', href: '/plan', active: pathname === '/plan' }
];

// Update header component to include Swedish branding
<Header 
  title="Skooli"
  navigation={navigation}
  showUserDropdown={true}
  className="bg-white/80 backdrop-blur-sm border-b border-[#E6F2F1]"
>
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-[#3E8E7E] rounded-xl flex items-center justify-center">
      <BookOpen className="h-5 w-5 text-white" />
    </div>
    <span className="text-xl font-playfair font-bold text-[#1C1C1C]">Skooli</span>
  </div>
</Header>
```

### Navigation Links
```tsx
<Link href="/path" className="text-[#333] hover:text-[#3E8E7E] transition-colors font-medium">
  Link Text
</Link>
```

### Back Navigation
```tsx
<Link href="/previous" className="flex items-center space-x-2 text-[#333] hover:text-[#3E8E7E] transition-colors">
  <svg className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
  <span>Tillbaka</span>
</Link>
```

---

## 🎛️ COMPONENT SYSTEM

### Button Component
**File**: `/src/app/components/button.tsx`

```tsx
import Button from './button';

<Button 
  text="Button Text"
  variant="primary|secondary|outline|ghost|danger"
  size="default|sm|lg|icon"
  className="additional-classes"
  callBack={() => {}}
/>
```

**Variant Styles**:
- `primary`: Green background (#3E8E7E) with white text
- `secondary`: Light green (#88C9BF) with white text
- `outline`: Green border with green text, fills on hover
- `ghost`: Transparent with green text, subtle background on hover

### Input Field Component  
**File**: `/src/app/components/inputField.tsx`

```tsx
import InputField from './inputField';

<InputField
  name="fieldName"
  label="Field Label"
  placeholder="Placeholder text..."
  value={value}
  onChange={setValue}
  error={error}
  required={true}
  type="text"
/>
```

### Select Component
**File**: `/src/app/components/select.tsx`

```tsx
import Select from './select';

interface Option {
  value: string;
  label: string;
}

<Select
  label="Select Label"
  value={selectedValue}
  onValueChange={setSelectedValue}
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" }
  ]}
  placeholder="Choose option..."
  error={error}
  required={true}
/>
```

### TextArea Component
**File**: `/src/app/components/textAreaField.tsx`

```tsx
import TextAreaField from './textAreaField';

<TextAreaField
  name="textareaName"
  label="Textarea Label"
  placeholder="Enter text here..."
  value={value}
  onChange={setValue}
  rows={4}
  error={error}
  required={false}
/>
```

---

## 🎨 ILLUSTRATION PATTERNS

### Forest Scene Elements (Homepage)
```tsx
{/* Trees - varied heights and colors */}
<div className="flex justify-center space-x-4">
  <div className="w-16 h-24 bg-[#88C9BF] rounded-t-full relative">
    <div className="w-4 h-8 bg-[#A4D4AE] mx-auto"></div>
  </div>
  <div className="w-20 h-28 bg-[#3E8E7E] rounded-t-full relative">
    <div className="w-5 h-10 bg-[#A4D4AE] mx-auto"></div>
  </div>
</div>

{/* Animals - simple geometric shapes */}
<div className="w-12 h-12 bg-[#A4D4AE] rounded-full relative">
  <div className="w-3 h-3 bg-[#3E8E7E] rounded-full absolute top-2 left-2"></div>
  <div className="w-3 h-3 bg-[#3E8E7E] rounded-full absolute top-2 right-2"></div>
</div>
```

### Feature Icons with Backgrounds
```jsx
<div className="w-8 h-8 bg-[#3E8E7E]/10 rounded-full flex items-center justify-center">
  <svg className="h-4 w-4 text-[#3E8E7E]" viewBox="0 0 24 24" stroke="currentColor">
    {/* Icon path */}
  </svg>
</div>
```

### Numbered Steps (Process Flow)
```jsx
<div className="w-20 h-20 bg-gradient-to-br from-[#3E8E7E] to-[#88C9BF] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
  <span className="text-3xl font-bold text-white">1</span>
</div>
```

---

## ⚡ INTERACTIVE STATES

### Hover Transitions
- All interactive elements use `transition-colors duration-200` or `transition-all duration-200`
- Links: `text-[#333] hover:text-[#3E8E7E]`
- Buttons: Built-in hover states in component variants
- Cards: Subtle shadow increase on hover

### Focus States
- Form fields: `focus-visible:ring-2 focus-visible:ring-[#3E8E7E]`
- Buttons: `focus-visible:ring-2 focus-visible:ring-offset-2`
- Custom focus indicators match brand colors

### Loading States
```jsx
<Spinner size="default|sm|lg" color="primary|white" />
```

---

## 📐 SPACING & SIZING

### Standard Spacing Scale
- `space-x-2, space-y-2`: 8px - Tight spacing
- `space-x-4, space-y-4`: 16px - Default spacing
- `space-x-6, space-y-6`: 24px - Comfortable spacing
- `space-x-8, space-y-8`: 32px - Section spacing
- `space-x-12, space-y-12`: 48px - Large section spacing

### Padding Standards
- Cards: `p-8` (32px) for main content areas
- Forms: `p-6` (24px) for form containers  
- Navigation: `px-6 py-6` (24px) for consistent nav spacing

### Border Radius
- Buttons: `rounded-md` (6px) default, `rounded-xl` (12px) for large
- Cards: `rounded-3xl` (24px) for prominent content cards
- Form fields: `rounded-md` (6px) for consistency

---

## 🇸🇪 CONTENT PATTERNS

### Swedish Language Content
- All user-facing text in Swedish
- Educational terminology following Swedish curriculum
- Consistent voice: Professional yet friendly
- Button text: Action-oriented (e.g., "Skapa", "Generera", "Kopiera")

---

## 🗣️ CONTENT PERSONALITY & VOICE

### Swedish Educational Tone
- **Professional yet Warm**: Respects teacher expertise while being approachable and supportive
- **Action-Oriented**: Clear verbs that encourage forward movement and progress ("Skapa", "Utforska", "Utveckla")
- **Supportive Language**: Assumes positive intent and capability, never condescending or overly technical
- **Educational Partnership**: Content positions the tool as a knowledgeable collaborator, not a replacement for teacher expertise

### Voice Characteristics
- **Encouraging**: "Skapa Din Första Lektion" rather than "Börja Här" - implies capability and ownership
- **Inclusive**: "Vår AI följer Läroplanen" - collaborative language that includes the teacher in the process  
- **Confident**: "Sparar 5 timmar per vecka" - specific, believable benefits rather than vague promises
- **Respectful**: "Fyll i formuläret nedan så skapar vår AI..." - explains process transparently

### Content Hierarchy Psychology
- **Scannable Structure**: Headers and lists support busy teacher workflows and quick information gathering
- **Progressive Detail**: Summary first, then details for users who want deeper understanding
- **Context-Aware**: Content adapts to where teachers are in their planning process (exploration vs. creation vs. refinement)
- **Outcome-Focused**: Content emphasizes the end result (complete lesson plans) rather than the technology

### Swedish Cultural Nuances
- **Direct Communication**: Clear, honest language without unnecessary elaboration (Lagom principle)
- **Collaborative Framing**: "Together we create" rather than "The AI creates" - reflects Swedish consensus culture
- **Practical Focus**: Content emphasizes concrete benefits and real classroom applications
- **Humble Confidence**: Professional capability expressed without boastfulness or overselling

---

### Content Hierarchy Examples
```tsx
// Hero Section Pattern
<h1 className="text-5xl lg:text-6xl font-playfair font-bold text-[#1C1C1C]">
  Main Headline with <span className="text-[#3E8E7E]">Colored Accent</span>
</h1>
<p className="text-xl text-[#333] leading-relaxed">
  Supporting description text in larger, comfortable reading size.
</p>

// Feature List Pattern
<div className="flex items-center space-x-4">
  <div className="w-8 h-8 bg-[#3E8E7E]/10 rounded-full flex items-center justify-center">
    <svg className="h-4 w-4 text-[#3E8E7E]">...</svg>
  </div>
  <span className="text-[#333] text-lg">Feature description</span>
</div>
```

---

## 📱 RESPONSIVE PATTERNS

### Mobile-First Approach
- Use `sm:`, `md:`, `lg:` breakpoints progressively
- Stack layouts on mobile: `flex-col sm:flex-row`
- Hide navigation items on small screens: `hidden md:flex`
- Adjust illustration complexity: `opacity-60 sm:opacity-90`

### Grid Patterns
```tsx
// Two-column layout (responsive)
<div className="grid lg:grid-cols-2 gap-16 items-center">
  {/* Content */}
</div>

// Three-column features
<div className="grid md:grid-cols-3 gap-12">
  {/* Feature items */}
</div>

// Form grid
<div className="grid md:grid-cols-2 gap-6">
  {/* Form fields */}
</div>
```

---

## 🔄 PAGE-SPECIFIC PATTERNS

### Route Group Structure
The project uses Next.js route groups for organization:

**Public Pages** (`(public)` group):
- `/` - Homepage with Swedish Teacher Planner design
- `/generate` - Lesson plan generation form
- `/plan` - Results/lesson plan display page

**Authenticated Pages** (`(auth)` group):  
- `/dashboard` - User dashboard with existing auth header
- Swedish navbar integration within authenticated layout

### Homepage (`/`) - Public
- Hero section with illustration + content split
- Abstract background shapes for visual depth  
- Three-step process explanation
- Feature list with icons
- CTA buttons prominently placed
- Uses public layout (no auth header)

### Generate Page (`/generate`) - Public
- Centered form in glass card
- Two-column form layout on desktop
- Loading state overlay during generation
- Clear validation error handling
- Accessible from public navigation

### Plan Page (`/plan`) - Public
- Success message at top
- Action buttons (copy, download)
- Formatted text display in monospace
- Call-to-action to create new plan
- Shareable results page

### Dashboard (`/dashboard`) - Authenticated
- Existing user dashboard functionality
- Enhanced header with Swedish navigation elements
- Maintains existing auth patterns and user context

---

## ⚠️ IMPLEMENTATION GUIDELINES

### DO:
- ✅ Use existing component variants instead of creating new styles
- ✅ Follow the established color palette exactly
- ✅ Maintain consistent spacing using Tailwind scale
- ✅ Include proper z-index layering for background shapes
- ✅ Use Swedish language for all user-facing text
- ✅ Include accessibility attributes (labels, focus states)
- ✅ Apply glass morphism effect to prominent content cards

### DON'T:
- ❌ Create custom CSS - use Tailwind utilities and component props
- ❌ Use colors outside the defined palette
- ❌ Skip the abstract background shapes on new pages
- ❌ Use English text in user interface
- ❌ Forget responsive considerations
- ❌ Override existing component styling with custom classes
- ❌ Skip proper z-index management

---

## 🎯 CONSISTENCY CHECKLIST

When implementing new pages or components:

- [ ] **Colors**: All colors from established palette
- [ ] **Typography**: Inter for body, Playfair Display for headings
- [ ] **Background**: Include abstract circular shapes with proper z-index
- [ ] **Navigation**: Consistent logo and navigation patterns
- [ ] **Cards**: Use glass morphism effect where appropriate  
- [ ] **Spacing**: Follow established padding/margin scale
- [ ] **Components**: Use existing button/form component variants
- [ ] **Language**: All text in Swedish, consistent with existing pages
- [ ] **Responsive**: Mobile-first with appropriate breakpoints
- [ ] **Accessibility**: Proper focus states and semantic HTML

---

## 📚 REFERENCE FILES

### Key Implementation Files:
- **Color System**: `/src/app/globals.css:10-16`
- **Button Component**: `/src/app/components/button.tsx:16-45`
- **Form Fields**: `/src/app/components/inputField.tsx`, `/src/app/components/select.tsx`
- **Homepage Layout**: `/src/app/page.tsx` (background shapes)
- **Navigation Pattern**: `/src/app/page.tsx` (public layout)
- **Auth Header**: `/src/app/components/header.tsx` (logged-in navigation)
- **Glass Card Example**: `/src/app/page.tsx`

### Component Usage Examples:
- **Home Page**: `/src/app/page.tsx` - Hero section, navigation, illustrations
- **Generate Page**: `/src/app/generate/page.tsx` - Forms, validation, loading states  
- **Plan Page**: `/src/app/plan/page.tsx` - Success states, action buttons
- **Auth Header**: `/src/app/components/header.tsx` - Swedish navbar integration

This style guide should serve as the definitive reference for maintaining design consistency across the Skooli application. Always refer to the actual implemented patterns in the referenced files when in doubt.