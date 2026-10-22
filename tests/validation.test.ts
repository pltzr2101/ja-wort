import { describe, expect, it } from "vitest";
import { defaultContent } from "@/content/default";
import { rsvpSchema, siteContentSchema } from "@/lib/validation";

describe("siteContentSchema", () => {
  it("akzeptiert den vollstaendigen Default-Inhaltssatz", () => {
    expect(siteContentSchema.safeParse(defaultContent).success).toBe(true);
  });

  it("akzeptiert einen Teil-Inhaltssatz (nur ein Feld)", () => {
    const result = siteContentSchema.safeParse({ heroTitle: "Neuer Titel" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ heroTitle: "Neuer Titel" });
  });

  it("entfernt unbekannte Felder stillschweigend", () => {
    const result = siteContentSchema.safeParse({ heroTitle: "Hi", hackerPayload: "<script>" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).not.toHaveProperty("hackerPayload");
  });

  it("lehnt einen ungueltigen theme-Wert ab", () => {
    expect(siteContentSchema.safeParse({ theme: "neon" }).success).toBe(false);
  });

  it("lehnt schedule mit falschem Typ ab", () => {
    expect(siteContentSchema.safeParse({ schedule: { time: "12:00" } }).success).toBe(false);
    expect(siteContentSchema.safeParse({ schedule: [{ time: 123 }] }).success).toBe(false);
  });

  it("lehnt eine Sektion mit ungueltigem type ab", () => {
    const result = siteContentSchema.safeParse({
      sections: [{ key: "x", type: "evil", enabled: true }],
    });
    expect(result.success).toBe(false);
  });

  it("akzeptiert gueltige Sektionen inkl. optionaler Felder", () => {
    const result = siteContentSchema.safeParse({
      sections: [
        { key: "hero", type: "hero", enabled: true },
        {
          key: "img-1",
          type: "image",
          enabled: false,
          imageId: null,
          caption: "Bild",
          objectPosition: "center",
          objectFit: "cover",
        },
        { key: "text-1", type: "text", enabled: true, title: "Story", text: "Text" },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("rsvpSchema", () => {
  it("akzeptiert eine Absage ohne bedingte Felder", () => {
    const result = rsvpSchema.safeParse({
      name: "Max Mustermann",
      attending: "no",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("akzeptiert eine vollstaendige Zusage", () => {
    const result = rsvpSchema.safeParse({
      name: "Max Mustermann",
      attending: "yes",
      guests: 2,
      additionalNames: "Anna Musterfrau",
      hasChildren: true,
      childrenAges: "2 und 5",
      needsAccommodation: true,
      note: "Vegetarisch",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("akzeptiert additionalNames als optional", () => {
    const result = rsvpSchema.safeParse({
      name: "Max Mustermann",
      attending: "yes",
      guests: 2,
      hasChildren: false,
      needsAccommodation: false,
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("lehnt eine Zusage ohne Personenzahl ab", () => {
    const result = rsvpSchema.safeParse({ name: "Max", attending: "yes", website: "" });
    expect(result.success).toBe(false);
  });

  it("verlangt das Kinder-Alter bei hasChildren = true", () => {
    const result = rsvpSchema.safeParse({
      name: "Max",
      attending: "yes",
      guests: 2,
      hasChildren: true,
      childrenAges: "",
      needsAccommodation: false,
      website: "",
    });
    expect(result.success).toBe(false);
  });

  it("lehnt leeren Namen ab", () => {
    const result = rsvpSchema.safeParse({ name: " ", attending: "no", website: "" });
    expect(result.success).toBe(false);
  });

  it("lehnt ausgefuellten Honeypot ab", () => {
    const result = rsvpSchema.safeParse({
      name: "Max",
      attending: "no",
      website: "spam",
    });
    expect(result.success).toBe(false);
  });

  it("akzeptiert die Afterparty-Angabe als optional (true, false oder leer)", () => {
    const base = { name: "Max", attending: "yes", guests: 2, hasChildren: false };

    expect(rsvpSchema.safeParse({ ...base, afterparty: true, website: "" }).success).toBe(true);
    expect(rsvpSchema.safeParse({ ...base, afterparty: null, website: "" }).success).toBe(true);
    expect(rsvpSchema.safeParse({ ...base, website: "" }).success).toBe(true);
  });

  it("lehnt einen ungueltigen afterparty-Wert ab", () => {
    const result = rsvpSchema.safeParse({
      name: "Max",
      attending: "yes",
      guests: 2,
      hasChildren: false,
      afterparty: "ja",
      website: "",
    });
    expect(result.success).toBe(false);
  });
});
