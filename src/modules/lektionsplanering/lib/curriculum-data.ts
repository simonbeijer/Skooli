export interface CurriculumDocument {
  id: number;
  subject: string;
  grades: string[];
  keywords: string[];
  content: string;
  source: string;
  activities: string[];
  conceptTags: string[];
  pedagogicalLevel: 'concrete' | 'abstract' | 'mixed';
  crossCurricularLinks: string[];
  subjectScore?: number;
  themeScore?: number;
  pedagogicalScore?: number;
  totalScore?: number;
}

export interface CurriculumSearchResult {
  documents: CurriculumDocument[];
  relevanceScore: number;
}

export const curriculumData: CurriculumDocument[] = [
  {
    id: 1,
    subject: "Naturorienterande ämnen",
    grades: ["förskoleklass", "1", "2", "3"],
    keywords: ["djur", "habitat", "livsmiljö", "djurarter", "vilda djur", "husdjur", "fåglar", "fiskar", "insekter"],
    content: "Eleverna ska utveckla kunskaper om olika djurarter och deras livsmiljöer. Centralt innehåll omfattar djurs olika behov, hur de rör sig och var de lever. Förmågor inkluderar att kunna observera och beskriva djurs egenskaper och beteenden.",
    source: "Lgr22 - Naturorienterande ämnen, centralt innehåll årskurs 1-3",
    activities: [
      "Djurobservationer i närområdet med luppar och kikare",
      "Skapa djurkort med bilder och fakta om olika arter",
      "Bygga fågelholk och studera fågelbesök",
      "Djurspårning och avtryck i lera",
      "Besök på zoo eller naturum för djurstudier",
      "Dramatisera djurs rörelser och ljud"
    ],
    conceptTags: ["biologi", "ekologi", "observation", "klassificering"],
    pedagogicalLevel: "concrete",
    crossCurricularLinks: ["Svenska (berättelser om djur)", "Bild och form (djurteckning)", "Matematik (räkning av djur)"]
  },
  {
    id: 2,
    subject: "Naturorienterande ämnen",
    grades: ["3", "4", "5", "6"],
    keywords: ["rymden", "planeter", "solsystem", "stjärnor", "astronomi", "månen", "jorden", "universum"],
    content: "Eleverna ska utveckla förståelse för jorden som en planet i solsystemet och universums uppbyggnad. Centralt innehåll inkluderar planeternas egenskaper, månfaser och stjärnbilder. Förmågor omfattar att använda modeller för att förklara astronomiska fenomen.",
    source: "Lgr22 - Naturorienterande ämnen, centralt innehåll årskurs 4-6",
    activities: [
      "Bygga modell av solsystemet med olika material",
      "Stjärnkikande och identifiering av stjärnbilder",
      "Simulera månfaser med lampa och bollar",
      "Skapa rymdutställning med planetfakta",
      "Besök på planetarium eller rymdobservatorium",
      "Designa och bygga egna rymdraketer"
    ],
    conceptTags: ["astronomi", "fysik", "modellering", "reflektion"],
    pedagogicalLevel: "mixed",
    crossCurricularLinks: ["Matematik (avstånd och storlekar)", "Teknik (raketbygge)", "Svenska (science fiction-berättelser)"]
  },
  {
    id: 3,
    subject: "Samhällsorienterande ämnen",
    grades: ["4", "5", "6"],
    keywords: ["miljö", "hållbarhet", "återvinning", "klimat", "naturresurser", "föroreningar", "miljöpåverkan"],
    content: "Eleverna ska utveckla kunskaper om miljöfrågor och hållbar utveckling. Centralt innehåll behandlar människans påverkan på miljön och åtgärder för hållbarhet. Förmågor inkluderar att analysera miljöproblem och föreslå lösningar.",
    source: "Lgr22 - Samhällsorienterande ämnen, centralt innehåll årskurs 4-6",
    activities: [
      "Miljöaudit av skolan och förslag på förbättringar",
      "Sorteringsstation för återvinning i klassrummet",
      "Odla egna grönsaker i skolträdgården",
      "Undersöka vattenföroreningar i närområdet",
      "Skapa kampanj för miljömedvetenhet",
      "Besök på återvinningsanläggning"
    ],
    conceptTags: ["hållbarhet", "miljövetenskap", "samhällsansvar", "kritiskt tänkande"],
    pedagogicalLevel: "mixed",
    crossCurricularLinks: ["Naturorienterande ämnen (ekosystem)", "Svenska (argumenterande text)", "Matematik (statistik över förbrukning)"]
  },
  {
    id: 4,
    subject: "Samhällsorienterande ämnen",
    grades: ["2", "3", "4"],
    keywords: ["historia", "forntid", "medeltid", "kulturarv", "arkeologi", "monument", "tradition"],
    content: "Eleverna ska utveckla förståelse för historisk tid och hur människor levt förr. Centralt innehåll omfattar svenska traditioner och kulturarv. Förmågor inkluderar att använda historiska källor och dra slutsatser om det förflutna.",
    source: "Lgr22 - Samhällsorienterande ämnen, centralt innehåll årskurs 1-3",
    activities: [
      "Skapa tidslinje över svensk historia",
      "Bygga medeltida borg av kartong och lego",
      "Dramatisera historiska händelser",
      "Intervjua äldre personer om hur det var förr",
      "Besök på museum eller historisk plats",
      "Arkeologisk utgrävning i sandlådan"
    ],
    conceptTags: ["kronologi", "källkritik", "kulturförståelse", "reflektion"],
    pedagogicalLevel: "concrete",
    crossCurricularLinks: ["Svenska (sagor och myter)", "Bild och form (historisk konst)", "Idrott (traditionella lekar)"]
  },
  {
    id: 5,
    subject: "Naturorienterande ämnen",
    grades: ["förskoleklass", "1", "2"],
    keywords: ["kropp", "hälsa", "sinnen", "känslor", "hygien", "rörelse", "vila"],
    content: "Eleverna ska utveckla kunskaper om den egna kroppen och vad som påverkar hälsan. Centralt innehåll inkluderar kroppens olika delar och funktioner. Förmågor omfattar att beskriva hur kroppen fungerar och vad som påverkar hälsan.",
    source: "Lgr22 - Naturorienterande ämnen, centralt innehåll årskurs F-3",
    activities: [
      "Rita och benämna kroppsdelar på stora papper",
      "Sinnestest med olika material och lukter",
      "Undersöka hjärtslag före och efter rörelse",
      "Skapa hälsomeny med nyttiga livsmedel",
      "Hygienpraktik med tandborstning och handtvätt",
      "Känslokort och diskussion om olika känslor"
    ],
    conceptTags: ["anatomi", "fysiologi", "hälsopedagogik", "självkänsla"],
    pedagogicalLevel: "concrete",
    crossCurricularLinks: ["Idrott och hälsa (rörelse)", "Svenska (känslor och ord)", "Matematik (mätning av längd och vikt)"]
  },
  {
    id: 6,
    subject: "Naturorienterande ämnen",
    grades: ["1", "2", "3"],
    keywords: ["mat", "näring", "livsmedel", "odling", "matlagning", "hälsosam kost"],
    content: "Eleverna ska utveckla kunskaper om livsmedel och näring. Centralt innehåll omfattar varierad och näringsriktig kost. Förmågor inkluderar att planera och genomföra enkel matlagning.",
    source: "Lgr22 - Naturorienterande ämnen, centralt innehåll årskurs 1-3",
    activities: [
      "Odla kryddor och grönsaker i krukor",
      "Tillaga enkel mat som smörgåsar och fruktallad",
      "Sortera livsmedel efter näringsgrupper",
      "Besök på bondgård eller torg",
      "Skapa receptbok med enkla rätter",
      "Smaktest av olika frukter och grönsaker"
    ],
    conceptTags: ["näringslära", "matkultur", "praktisk tillämpning", "hållbarhet"],
    pedagogicalLevel: "concrete",
    crossCurricularLinks: ["Matematik (mätning och vikter)", "Svenska (recept och instruktioner)", "Samhällsorienterande ämnen (matkultur)"]
  },
  {
    id: 7,
    subject: "Teknik",
    grades: ["2", "3", "4", "5"],
    keywords: ["transport", "fordon", "rörelse", "teknik", "uppfinningar", "hjul", "motor"],
    content: "Eleverna ska utveckla förståelse för tekniska lösningar inom transport. Centralt innehåll omfattar hur olika fordon fungerar och utvecklats över tid. Förmågor inkluderar att konstruera och testa enkla fordon.",
    source: "Lgr22 - Teknik, centralt innehåll årskurs 1-6",
    activities: [
      "Bygga och testa bilar av återvinningsmaterial",
      "Undersöka olika hjultyper och deras egenskaper",
      "Skapa tidslinje över transportens utveckling",
      "Konstruera broar och testa belastning",
      "Experimentera med vindkraft och segelbilar",
      "Besök på teknisk museum eller bilmuseum"
    ],
    conceptTags: ["mekanik", "konstruktion", "problemlösning", "innovation"],
    pedagogicalLevel: "mixed",
    crossCurricularLinks: ["Matematik (mätning och geometri)", "Naturorienterande ämnen (fysik)", "Samhällsorienterande ämnen (transporthistoria)"]
  },
  {
    id: 8,
    subject: "Svenska",
    grades: ["förskoleklass", "1", "2", "3"],
    keywords: ["familj", "hem", "relationer", "berättelser", "känslor", "traditioner"],
    content: "Eleverna ska utveckla språkliga förmågor genom texter om familj och hem. Centralt innehåll inkluderar berättelser och rim. Förmågor omfattar att läsa, skriva och samtala om egna upplevelser.",
    source: "Lgr22 - Svenska, centralt innehåll årskurs F-3",
    activities: [
      "Skriva och illustrera berättelser om familjen",
      "Familjeträd med bilder och berättelser",
      "Intervjua familjemedlemmar om barndom",
      "Dramatisera familjesituationer",
      "Läsa böcker om olika familjekonstellationer",
      "Skapa familjens kokbok med favoritrecept"
    ],
    conceptTags: ["berättande", "identitet", "språkutveckling", "kulturförståelse"],
    pedagogicalLevel: "concrete",
    crossCurricularLinks: ["Samhällsorienterande ämnen (familjetraditioner)", "Bild och form (familjeporträtt)", "Musik (familjesånger)"]
  },
  {
    id: 9,
    subject: "Matematik",
    grades: ["1", "2", "3", "4"],
    keywords: ["geometri", "former", "mönster", "symmetri", "mätning", "rymd"],
    content: "Eleverna ska utveckla geometrisk förståelse och rumsuppfattning. Centralt innehåll omfattar grundläggande geometriska former och deras egenskaper. Förmågor inkluderar att identifiera och beskriva geometriska mönster.",
    source: "Lgr22 - Matematik, centralt innehåll årskurs 1-3",
    activities: [
      "Formsökning i klassrummet och utomhus",
      "Bygga med geometriska klossar och former",
      "Skapa symmetriska mönster med speglar",
      "Mäta och jämföra längder med olika redskap",
      "Tangram och andra formpussel",
      "Geometrisk konst med olika material"
    ],
    conceptTags: ["rumsuppfattning", "mönstererkännande", "mätning", "visualisering"],
    pedagogicalLevel: "concrete",
    crossCurricularLinks: ["Bild och form (geometrisk design)", "Teknik (konstruktion)", "Idrott (rörelser i rummet)"]
  },
  {
    id: 10,
    subject: "Bild och form",
    grades: ["förskoleklass", "1", "2", "3", "4"],
    keywords: ["konst", "skapande", "färger", "material", "uttryck", "kreativitet"],
    content: "Eleverna ska utveckla sin kreativa förmåga och bildspråk. Centralt innehåll omfattar olika material och tekniker. Förmågor inkluderar att skapa och reflektera över egna och andras bilder.",
    source: "Lgr22 - Bild och form, centralt innehåll årskurs F-6",
    activities: [
      "Experimentera med olika målartekniker",
      "Skapa collage med naturmaterial",
      "Modellera med lera och andra formbara material",
      "Fotografera och skapa digitala berättelser",
      "Studiebesök på konstmuseum eller galleri",
      "Skapa gemensam väggmålning för skolan"
    ],
    conceptTags: ["estetik", "kreativitet", "reflektion", "kulturförståelse"],
    pedagogicalLevel: "mixed",
    crossCurricularLinks: ["Svenska (visuellt berättande)", "Naturorienterande ämnen (naturens former och färger)", "Matematik (geometriska former)"]
  },
  {
    id: 11,
    subject: "Musik",
    grades: ["förskoleklass", "1", "2", "3", "4", "5"],
    keywords: ["sång", "rytm", "instrument", "dans", "lyssning", "komposition"],
    content: "Eleverna ska utveckla musikaliska förmågor genom sång, spel och lyssnande. Centralt innehåll omfattar olika musikstilar och kulturer. Förmågor inkluderar att musicera och reflektera över musik.",
    source: "Lgr22 - Musik, centralt innehåll årskurs F-6",
    activities: [
      "Sjunga traditionella svenska sånger",
      "Bygga egna instrument av återvinningsmaterial",
      "Komponera enkla melodier och rytmer",
      "Dansa till musik från olika kulturer",
      "Lyssna på klassisk musik och berätta vad den påminner om",
      "Skapa ljud-landskap med olika material"
    ],
    conceptTags: ["rytm", "melodi", "kulturmångfald", "uttryck"],
    pedagogicalLevel: "concrete",
    crossCurricularLinks: ["Svenska (sångtexter och rim)", "Matematik (rytmiska mönster)", "Idrott och hälsa (dans och rörelse)"]
  },
  {
    id: 12,
    subject: "Idrott och hälsa",
    grades: ["förskoleklass", "1", "2", "3", "4", "5", "6"],
    keywords: ["rörelse", "lek", "spel", "kondition", "styrka", "samarbete", "fair play"],
    content: "Eleverna ska utveckla sin motorik och förståelse för rörelsens betydelse för hälsan. Centralt innehåll omfattar olika rörelseformer och lekar. Förmågor inkluderar att röra sig på olika sätt och följa regler.",
    source: "Lgr22 - Idrott och hälsa, centralt innehåll årskurs F-6",
    activities: [
      "Traditionella lekar som kurragömma och hage",
      "Hinderbanor med olika rörelseupgifter",
      "Bollspel och enklare lagsporter",
      "Dans och rytmiska rörelser",
      "Utomhusaktiviteter som orientering",
      "Avslappning och mindfulness-övningar"
    ],
    conceptTags: ["motorik", "samarbete", "hälsa", "regelförståelse"],
    pedagogicalLevel: "concrete",
    crossCurricularLinks: ["Matematik (tid och mätning)", "Musik (rytm och dans)", "Naturorienterande ämnen (kropp och hälsa)"]
  },
  {
    id: 13,
    subject: "Naturorienterande ämnen",
    grades: ["3", "4", "5", "6"],
    keywords: ["väder", "klimat", "vattenkretslopp", "årstider", "temperatur", "nederbörd"],
    content: "Eleverna ska utveckla förståelse för väder och klimat. Centralt innehåll omfattar vattnets kretslopp och väderförändringar. Förmågor inkluderar att observera och dokumentera väderförändringar.",
    source: "Lgr22 - Naturorienterande ämnen, centralt innehåll årskurs 4-6",
    activities: [
      "Daglig väderobservation med termometer och regenmätare",
      "Bygga vattenkretsloppsmodell med akvarier",
      "Skapa väderstation på skolgården",
      "Studera molntyper och vad de betyder",
      "Experiment med avdunstning och kondensation",
      "Jämföra väder mellan olika platser i världen"
    ],
    conceptTags: ["meteorologi", "observation", "dataanalys", "systemtänkande"],
    pedagogicalLevel: "mixed",
    crossCurricularLinks: ["Matematik (diagram och statistik)", "Geografi (klimatzoner)", "Teknik (mätinstrument)"]
  },
  {
    id: 14,
    subject: "Teknik",
    grades: ["3", "4", "5", "6"],
    keywords: ["energi", "el", "kraft", "maskiner", "automation", "hållbar teknik"],
    content: "Eleverna ska utveckla förståelse för energi och tekniska system. Centralt innehåll omfattar olika energislag och tekniska lösningar. Förmågor inkluderar att konstruera och utvärdera tekniska lösningar.",
    source: "Lgr22 - Teknik, centralt innehåll årskurs 4-6",
    activities: [
      "Bygga enkla elkretsloppsmodeller",
      "Konstruera vindkraftverk och solpaneler",
      "Experimentera med magnet- och elektromagnetisk kraft",
      "Bygga automatiserade system med enkla sensorer",
      "Undersöka energieffektivitet i hemmet",
      "Designa miljövänliga tekniska lösningar"
    ],
    conceptTags: ["energi", "automation", "hållbarhet", "innovation"],
    pedagogicalLevel: "abstract",
    crossCurricularLinks: ["Naturorienterande ämnen (fysik)", "Matematik (mätning och beräkning)", "Samhällsorienterande ämnen (miljöteknik)"]
  },
  {
    id: 15,
    subject: "Svenska",
    grades: ["4", "5", "6"],
    keywords: ["läsförståelse", "textanalys", "källkritik", "argumentation", "reflektion"],
    content: "Eleverna ska utveckla läsförståelse och kritiskt tänkande. Centralt innehåll omfattar olika texttyper och källkritik. Förmågor inkluderar att analysera och värdera texter.",
    source: "Lgr22 - Svenska, centralt innehåll årskurs 4-6",
    activities: [
      "Läsa och jämföra nyhetsartiklar från olika källor",
      "Skriva argumenterande texter om aktuella frågor",
      "Boksamtal och litteraturcirklar",
      "Analysera reklam och dess påverkan",
      "Skapa egen tidning eller blogg",
      "Debattera aktuella ämnen med faktaunderlag"
    ],
    conceptTags: ["källkritik", "argumentation", "textanalys", "mediekunnighet"],
    pedagogicalLevel: "abstract",
    crossCurricularLinks: ["Samhällsorienterande ämnen (demokrati)", "Naturorienterande ämnen (vetenskaplig metod)", "Bild och form (visuell kommunikation)"]
  },
  {
    id: 16,
    subject: "Matematik",
    grades: ["4", "5", "6"],
    keywords: ["statistik", "sannolikhet", "diagram", "dataanalys", "undersökning", "presentation"],
    content: "Eleverna ska utveckla förmågan att samla in, bearbeta och presentera data. Centralt innehåll omfattar tabeller, diagram och enkla statistiska begrepp. Förmågor inkluderar att genomföra undersökningar och dra slutsatser.",
    source: "Lgr22 - Matematik, centralt innehåll årskurs 4-6",
    activities: [
      "Genomföra undersökning om klasskamraternas intressen",
      "Skapa diagram och grafer av insamlad data",
      "Analysera statistik från sport och samhälle",
      "Experimentera med slumpspel och sannolikhet",
      "Presentera resultat för andra klasser",
      "Använda digitala verktyg för databearbetning"
    ],
    conceptTags: ["dataanalys", "presentation", "kritiskt tänkande", "digitala verktyg"],
    pedagogicalLevel: "abstract",
    crossCurricularLinks: ["Naturorienterande ämnen (vetenskapliga undersökningar)", "Samhällsorienterande ämnen (samhällsstatistik)", "Svenska (presentation av resultat)"]
  },
  {
    id: 17,
    subject: "Samhällsorienterande ämnen",
    grades: ["5", "6"],
    keywords: ["demokrati", "rättigheter", "skyldigheter", "politik", "val", "medbestämmande"],
    content: "Eleverna ska utveckla förståelse för demokratiska processer och medborgerliga rättigheter. Centralt innehåll omfattar demokratins principer och elevers inflytande. Förmågor inkluderar att delta i demokratiska processer.",
    source: "Lgr22 - Samhällsorienterande ämnen, centralt innehåll årskurs 4-6",
    activities: [
      "Genomföra klassval med riktiga valförfaranden",
      "Skapa klassråd med förslag och beslut",
      "Studera Barnkonventionen och dess betydelse",
      "Intervjua lokala politiker om deras arbete",
      "Debattera aktuella samhällsfrågor",
      "Organisera kampanj för skolförbättringar"
    ],
    conceptTags: ["demokrati", "medborgarskap", "inflytande", "rättigheter"],
    pedagogicalLevel: "abstract",
    crossCurricularLinks: ["Svenska (argumenterande tal)", "Matematik (val och statistik)", "Bild och form (politiska budskap)"]
  }
];

// Helper function to calculate subject relevance
function calculateSubjectRelevance(subjects: string[], docSubject: string): number {
  if (subjects.length === 0) return 0.5;
  
  const subjectMatches = subjects.some(subject => 
    subject.toLowerCase().includes(docSubject.toLowerCase()) ||
    docSubject.toLowerCase().includes(subject.toLowerCase())
  );
  
  return subjectMatches ? 1.0 : 0.2;
}

// Helper function to calculate theme relevance using semantic matching
function calculateThemeRelevance(theme: string, document: CurriculumDocument): number {
  const themeWords = theme.toLowerCase().split(/\s+/);
  let totalRelevance = 0;
  let matchCount = 0;

  // Check keywords
  for (const keyword of document.keywords) {
    for (const themeWord of themeWords) {
      if (keyword.toLowerCase().includes(themeWord) || themeWord.includes(keyword.toLowerCase())) {
        totalRelevance += 1.0;
        matchCount++;
      }
    }
  }

  // Check content
  const contentLower = document.content.toLowerCase();
  for (const themeWord of themeWords) {
    if (contentLower.includes(themeWord)) {
      totalRelevance += 0.5;
      matchCount++;
    }
  }

  // Check concept tags
  for (const tag of document.conceptTags) {
    for (const themeWord of themeWords) {
      if (tag.toLowerCase().includes(themeWord) || themeWord.includes(tag.toLowerCase())) {
        totalRelevance += 0.7;
        matchCount++;
      }
    }
  }

  // Semantic associations for Swedish themes
  const themeAssociations: { [key: string]: string[] } = {
    'djur': ['natur', 'biologi', 'ekologi', 'habitat', 'arter', 'observation'],
    'rymden': ['astronomi', 'planeter', 'stjärnor', 'universum', 'fysik', 'modeller'],
    'miljö': ['hållbarhet', 'klimat', 'återvinning', 'ekologi', 'naturresurser'],
    'historia': ['förr', 'kulturarv', 'tradition', 'kronologi', 'källkritik'],
    'kropp': ['hälsa', 'anatomi', 'sinnen', 'rörelse', 'hygien', 'känslor'],
    'mat': ['näring', 'livsmedel', 'hälsa', 'odling', 'matkultur', 'kost'],
    'transport': ['fordon', 'teknik', 'rörelse', 'utveckling', 'innovation'],
    'familj': ['hem', 'relationer', 'traditioner', 'berättelser', 'identitet'],
    'matematik': ['tal', 'räkning', 'geometri', 'mätning', 'problem', 'logik'],
    'språk': ['läsning', 'skrivning', 'kommunikation', 'berättelse', 'ordförråd']
  };

  for (const themeWord of themeWords) {
    if (themeAssociations[themeWord]) {
      for (const association of themeAssociations[themeWord]) {
        if (document.keywords.some(k => k.toLowerCase().includes(association)) ||
            document.conceptTags.some(t => t.toLowerCase().includes(association)) ||
            contentLower.includes(association)) {
          totalRelevance += 0.3;
          matchCount++;
        }
      }
    }
  }

  return matchCount > 0 ? Math.min(totalRelevance / Math.max(matchCount, 1), 1.0) : 0;
}

// Helper function to calculate pedagogical relevance
function calculatePedagogicalRelevance(grade: string, document: CurriculumDocument): number {
  // Check if grade matches exactly
  if (document.grades.includes(grade)) {
    return 1.0;
  }

  // Calculate proximity for numeric grades
  const numericGrade = parseInt(grade);
  if (!isNaN(numericGrade)) {
    let minDistance = Infinity;
    for (const docGrade of document.grades) {
      const docNumeric = parseInt(docGrade);
      if (!isNaN(docNumeric)) {
        const distance = Math.abs(numericGrade - docNumeric);
        minDistance = Math.min(minDistance, distance);
      }
    }
    
    if (minDistance <= 1) return 0.8;
    if (minDistance <= 2) return 0.6;
    if (minDistance <= 3) return 0.4;
  }

  // Handle förskoleklass proximity
  if (grade === 'förskoleklass' && document.grades.includes('1')) {
    return 0.8;
  }
  if (grade === '1' && document.grades.includes('förskoleklass')) {
    return 0.8;
  }

  return 0.2;
}

export function findRelevantCurriculum(
  theme: string, 
  grade: string, 
  subjects: string[]
): CurriculumSearchResult {
  // Filter by grade first (mandatory)
  const gradeFilteredDocs = curriculumData.filter(doc => 
    calculatePedagogicalRelevance(grade, doc) >= 0.4
  );

  // Calculate scores for each document
  const scoredDocuments = gradeFilteredDocs.map(doc => {
    const subjectScore = calculateSubjectRelevance(subjects, doc.subject);
    const themeScore = calculateThemeRelevance(theme, doc);
    const pedagogicalScore = calculatePedagogicalRelevance(grade, doc);
    
    // Weighted scoring: Subject (40%), Theme (40%), Pedagogical (20%)
    const totalScore = (subjectScore * 0.4) + (themeScore * 0.4) + (pedagogicalScore * 0.2);

    return {
      ...doc,
      subjectScore,
      themeScore,
      pedagogicalScore,
      totalScore
    };
  });

  // Filter by minimum relevance threshold
  const relevantDocuments = scoredDocuments.filter(doc => 
    doc.totalScore >= 0.3
  );

  // Sort by total score (descending) and take top 4
  const sortedDocuments = relevantDocuments
    .sort((a, b) => b.totalScore! - a.totalScore!)
    .slice(0, 4);

  // Calculate overall relevance score
  const relevanceScore = sortedDocuments.length > 0 
    ? sortedDocuments.reduce((sum, doc) => sum + doc.totalScore!, 0) / sortedDocuments.length 
    : 0;

  return {
    documents: sortedDocuments,
    relevanceScore: Math.round(relevanceScore * 1000) / 1000 // Round to 3 decimal places
  };
}