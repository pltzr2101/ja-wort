import { z } from "zod";

/**
 * Zod-Schema fuer das RSVP-Formular. Erzwingt die bedingte Logik
 * auch serverseitig (nicht nur im UI):
 * - Personenzahl, Kinder und Unterkunft sind nur bei Zusage relevant.
 * - Kinder-Alter ist nur bei "Kinder vorhanden = Ja" Pflicht.
 */
export const rsvpSchema = z
  .object({
    name: z.string().trim().min(2, "Bitte gib deinen Namen an.").max(120),
    attending: z.enum(["yes", "no"]),
    guests: z.number().int().min(1).max(10).nullable().optional(),
    additionalNames: z.string().trim().max(500).nullable().optional(),
    hasChildren: z.boolean().nullable().optional(),
    childrenAges: z.string().trim().max(200).nullable().optional(),
    needsAccommodation: z.boolean().nullable().optional(),
    note: z.string().trim().max(500).nullable().optional(),
    // Honeypot: muss leer bleiben, sonst Bot-Verdacht.
    website: z.string().max(0).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.attending === "yes") {
      if (data.guests == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guests"],
          message: "Bitte waehle die Personenzahl.",
        });
      }
      if (data.hasChildren == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hasChildren"],
          message: "Bitte gib an, ob Kinder dabei sind.",
        });
      }
      if (data.hasChildren === true && (!data.childrenAges || data.childrenAges.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["childrenAges"],
          message: "Bitte gib das Alter der Kinder an.",
        });
      }
    }
  });

export type RsvpInput = z.infer<typeof rsvpSchema>;
