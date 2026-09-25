import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Contact from "@/components/sections/Contact";
import { defaultContent, type SiteContent } from "@/content/default";

function content(partial: Partial<SiteContent> = {}): SiteContent {
  return {
    ...defaultContent,
    contactTitle: "Kontakt",
    contactName: "Julian",
    contactPhone: "+49 170 1234567",
    contactEmail: "julian@example.com",
    ...partial,
  };
}

describe("Contact", () => {
  afterEach(() => {
    cleanup();
  });

  it("rendert Titel, Name, Telefon und E-Mail", () => {
    render(<Contact content={content()} locale="de" />);
    expect(screen.getByText("Kontakt")).toBeInTheDocument();
    expect(screen.getByText("Julian")).toBeInTheDocument();
    // Telefonnummer erscheint zweimal (Telefon + WhatsApp).
    expect(screen.getAllByText("+49 170 1234567")).toHaveLength(2);
    expect(screen.getByText("julian@example.com")).toBeInTheDocument();
  });

  it("rendert nichts ohne Kontaktdaten", () => {
    const { container } = render(
      <Contact
        content={content({ contactName: "", contactPhone: "", contactEmail: "" })}
        locale="de"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("setzt tel:-, wa.me- und mailto-Links", () => {
    render(<Contact content={content()} locale="de" />);
    const links = screen.getAllByRole("link");

    expect(links.some((a) => a.getAttribute("href") === "tel:+49 170 1234567")).toBe(true);
    expect(links.some((a) => a.getAttribute("href") === "https://wa.me/491701234567")).toBe(true);
    expect(links.some((a) => a.getAttribute("href") === "mailto:julian@example.com")).toBe(true);
  });

  it("verwendet koreanische Labels", () => {
    render(
      <Contact
        content={content({ contactName: "지민", contactPhone: "+82 10 1234 5678" })}
        locale="ko"
      />
    );
    expect(screen.getByText("전화")).toBeInTheDocument();
    expect(screen.getByText("이메일")).toBeInTheDocument();
  });
});
