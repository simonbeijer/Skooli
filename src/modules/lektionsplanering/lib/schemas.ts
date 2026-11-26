/**
 * Lektionsplanering: valideringsschema för generate-plan.
 * (Används inte av routen ännu, flyttat från src/lib/api/schemas.ts.)
 */

import { z } from "zod";

/**
 * Lesson plan generation schema for future Gemini integration
 */
export const GeneratePlanSchema = z.object({
  theme: z
    .string({
      required_error: "Theme is required",
      invalid_type_error: "Theme must be a string"
    })
    .trim()
    .min(1, "Theme cannot be empty")
    .max(500, "Theme must be less than 500 characters"),
  
  grade: z
    .string({
      required_error: "Grade is required",
      invalid_type_error: "Grade must be a string"
    })
    .trim()
    .min(1, "Grade cannot be empty")
    .max(50, "Grade must be less than 50 characters"),
  
  subjects: z
    .string({
      required_error: "Subjects are required",
      invalid_type_error: "Subjects must be a string"
    })
    .trim()
    .min(1, "Subjects cannot be empty")
    .max(200, "Subjects must be less than 200 characters"),
  
  lessonCount: z
    .number({
      required_error: "Antal lektioner krävs",
      invalid_type_error: "Antal lektioner måste vara ett tal"
    })
    .int("Antal lektioner måste vara ett heltal")
    .min(1, "Antal lektioner måste vara minst 1")
    .max(8, "Antal lektioner får vara högst 8"),
  
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  
  difficulty: z
    .enum(["beginner", "intermediate", "advanced"], {
      invalid_type_error: "Difficulty must be beginner, intermediate, or advanced"
    })
    .default("intermediate"),
  
  includeActivities: z
    .boolean({
      invalid_type_error: "Include activities must be a boolean"
    })
    .default(true),
  
  includeAssessment: z
    .boolean({
      invalid_type_error: "Include assessment must be a boolean"
    })
    .default(false)
});

export type GeneratePlanInput = z.infer<typeof GeneratePlanSchema>;
