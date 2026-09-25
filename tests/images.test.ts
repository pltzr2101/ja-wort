import { beforeEach, describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { addImage, getImages, reorderImages } from "@/lib/images";

describe("reorderImages", () => {
  beforeEach(() => {
    getDb().prepare("DELETE FROM images").run();
  });

  it("sortiert nach den uebergebenen IDs", () => {
    const a = addImage("a.jpg", null);
    const b = addImage("b.jpg", null);
    const c = addImage("c.jpg", null);

    expect(reorderImages([c.id, a.id, b.id])).toBe(true);
    expect(getImages().map((image) => image.filename)).toEqual(["c.jpg", "a.jpg", "b.jpg"]);
  });

  it("ignoriert unbekannte IDs, ohne die anderen zu verschieben", () => {
    const a = addImage("a.jpg", null);
    const b = addImage("b.jpg", null);

    reorderImages([b.id, 999999, a.id]);
    expect(getImages().map((image) => image.filename)).toEqual(["b.jpg", "a.jpg"]);
  });

  it("liefert false bei einer leeren Liste", () => {
    expect(reorderImages([])).toBe(false);
  });
});
