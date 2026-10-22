import { z } from "zod";

/**
 * Zod-Schema fuer den Inhaltsspeicher-Endpunkt (PUT /api/content).
 * Verhindert, dass unbekannte oder beschaedigte Felder ueber den
 * Admin-Endpunkt in die DB und damit auf die oeffentliche Seite
 * gelangen: Unbekannte Keys werden stillschweigend entfernt,
 * unbekannte Typen/Werte fuehren zu einem 400.
 */
const scheduleItemSchema = z.object({
  time: z.string().trim().max(50),
  title: z.string().trim().max(200),
  description: z.string().trim().max(1000),
});

const faqItemSchema = z.object({
  question: z.string().trim().max(500),
  answer: z.string().trim().max(2000),
});

const sectionTypeSchema = z.enum([
  "hero",
  "countdown",
  "gallery",
  "schedule",
  "rsvp",
  "map",
  "faq",
  "contact",
  "image",
  "text",
]);

const siteSectionSchema = z.object({
  key: z.string().trim().max(100),
  type: sectionTypeSchema,
  enabled: z.boolean(),
  imageId: z.number().int().nullable().optional(),
  // null wird vom UI moeglicherweise mitgeliefert; SiteSection erwartet nur
  // string|undefined, daher auf undefined normieren.
  caption: z
    .string()
    .max(300)
    .nullish()
    .transform((value) => value ?? undefined),
  objectPosition: z.string().max(100).optional(),
  objectFit: z.enum(["cover", "contain"]).optional(),
  title: z.string().max(300).optional(),
  text: z.string().max(5000).optional(),
});

export const siteContentSchema = z
  .object({
    theme: z.enum(["romantic", "modern", "rustic", "noir"]),
    coupleNames: z.string().max(200),
    weddingDate: z.string().max(40),
    locationName: z.string().max(200),
    heroTitle: z.string().max(200),
    heroSubtitle: z.string().max(300),
    heroObjectPosition: z.string().max(100),
    scheduleTitle: z.string().max(200),
    schedule: z.array(scheduleItemSchema).max(50),
    mapTitle: z.string().max(200),
    mapEmbedUrl: z.string().max(1000),
    faqTitle: z.string().max(200),
    faq: z.array(faqItemSchema).max(100),
    rsvpTitle: z.string().max(200),
    rsvpSubtitle: z.string().max(500),
    contactTitle: z.string().max(200),
    contactName: z.string().max(200),
    contactPhone: z.string().max(100),
    contactKakao: z.string().max(100),
    contactEmail: z.string().max(200),
    sections: z.array(siteSectionSchema).max(100),
    // Legacy-Felder alter Inhaltssatze: mergeContent uebernimmt sie in die
    // text-Sektion und verwirft sie danach.
    storyTitle: z.string().max(300).optional(),
    storyText: z.string().max(5000).optional(),
  })
  .partial();

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
    // Freiwillige Angabe: nur "Ja" (true) oder leer (null).
    afterparty: z.boolean().nullable().optional(),
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
