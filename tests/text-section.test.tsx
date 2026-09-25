import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import TextSection from "@/components/sections/TextSection";
import type { SiteSection } from "@/content/default";

function section(partial: Partial<SiteSection> = {}): SiteSection {
  return { key: "t", type: "text", enabled: true, ...partial };
}

describe("TextSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("rendert Titel und Text", () => {
    render(<TextSection section={section({ title: "Titel", text: "Inhalt" })} />);
    expect(screen.getByText("Titel")).toBeInTheDocument();
    expect(screen.getByText("Inhalt")).toBeInTheDocument();
  });

  it("rendert ohne Titel nur den Text", () => {
    render(<TextSection section={section({ text: "Nur Text" })} />);
    expect(screen.getByText("Nur Text")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("rendert nichts, wenn Titel und Text fehlen", () => {
    const { container } = render(<TextSection section={section()} />);
    expect(container.firstChild).toBeNull();
  });
});
