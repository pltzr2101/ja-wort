import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Hero from "@/components/sections/Hero";
import { defaultContent } from "@/content/default";

describe("Hero", () => {
  afterEach(() => {
    cleanup();
  });

  it("zeigt den Hero-Titel an", () => {
    render(<Hero content={defaultContent} images={[]} locale="de" />);
    expect(screen.getByText("Wir heiraten!")).toBeInTheDocument();
  });

  it("zeigt Hero-Titel, Namen und Untertitel gemeinsam an", () => {
    render(<Hero content={defaultContent} images={[]} locale="de" />);
    expect(screen.getByText("Wir heiraten!")).toBeInTheDocument();
    expect(screen.getByText("Anna & Jonas")).toBeInTheDocument();
    expect(screen.getByText("Anna & Jonas · 12. September 2026")).toBeInTheDocument();
  });
});
