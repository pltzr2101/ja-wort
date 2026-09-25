import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES, detectImageType, isSafeFilename, validateImageFile } from "@/lib/upload";

function padded(bytes: number[]): Buffer {
  const buffer = Buffer.alloc(16);
  bytes.forEach((byte, index) => {
    buffer[index] = byte;
  });
  return buffer;
}

describe("detectImageType", () => {
  it("erkennt JPEG", () => {
    expect(detectImageType(padded([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpg");
  });

  it("erkennt PNG", () => {
    expect(detectImageType(padded([0x89, 0x50, 0x4e, 0x47]))).toBe("png");
  });

  it("erkennt WebP", () => {
    const buffer = padded([0x52, 0x49, 0x46, 0x46]);
    buffer[8] = 0x57;
    buffer[9] = 0x45;
    buffer[10] = 0x42;
    buffer[11] = 0x50;
    expect(detectImageType(buffer)).toBe("webp");
  });

  it("erkennt unbekannte Daten nicht", () => {
    expect(detectImageType(padded([0x00, 0x01, 0x02, 0x03]))).toBeNull();
  });
});

describe("validateImageFile", () => {
  it("lehnt leere Dateien ab", () => {
    expect(validateImageFile("image/jpeg", Buffer.alloc(0))).toContain("leer");
  });

  it("lehnt zu grosse Dateien ab", () => {
    const big = Buffer.alloc(MAX_UPLOAD_BYTES + 1);
    expect(validateImageFile("image/jpeg", big)).toContain("5 MB");
  });

  it("lehnt unerlaubte MIME-Typen ab", () => {
    const jpeg = padded([0xff, 0xd8, 0xff, 0xe0]);
    expect(validateImageFile("image/gif", jpeg)).toContain("JPG, PNG oder WebP");
  });

  it("lehnt gefaelschte Bilder ab (MIME ok, Magic Bytes falsch)", () => {
    expect(validateImageFile("image/jpeg", padded([0x00, 0x01, 0x02]))).toContain(
      "kein gueltiges Bild"
    );
  });

  it("akzeptiert ein gueltiges JPEG", () => {
    expect(validateImageFile("image/jpeg", padded([0xff, 0xd8, 0xff, 0xe0]))).toBeNull();
  });
});

describe("isSafeFilename", () => {
  it("akzeptiert nur generierte Dateinamen", () => {
    expect(isSafeFilename("a".repeat(32) + ".jpg")).toBe(true);
    expect(isSafeFilename("../etc/passwd")).toBe(false);
    expect(isSafeFilename("photo.jpg")).toBe(false);
    expect(isSafeFilename("a".repeat(32) + ".exe")).toBe(false);
  });
});
