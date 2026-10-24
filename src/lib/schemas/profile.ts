import { z } from "zod"

// Empty inputs become null so a cleared field falls back to the official data.
const optional = <T extends z.ZodType<string>>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null), schema.nullable())

// Mirrors the CHECK constraints on association_profiles.
export const ProfileSchema = z.object({
  name: optional(z.string().max(250, "Nom trop long (250 caractères max).")),
  description: optional(z.string().max(5000, "Description trop longue (5 000 caractères max).")),
  address: optional(z.string().max(250, "Adresse trop longue.")),
  postal_code: optional(z.string().regex(/^\d{5}$/, "Code postal à 5 chiffres.")),
  city: optional(z.string().max(100, "Nom de ville trop long.")),
  email: optional(z.email("Adresse email invalide.").max(254)),
  phone: optional(z.string().max(30, "Numéro trop long.")),
  website: optional(
    z
      .string()
      .max(500, "Adresse trop longue.")
      .regex(/^https?:\/\/\S+$/i, "L'adresse doit commencer par https://")
  ),
})

export type Profile = z.infer<typeof ProfileSchema>

export const PROFILE_FIELDS = Object.keys(ProfileSchema.shape) as (keyof Profile)[]
