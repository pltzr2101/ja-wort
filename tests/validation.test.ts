import { describe, expect, it } from "vitest";
import { rsvpSchema } from "@/lib/validation";

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
});
