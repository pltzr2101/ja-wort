import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ImageFocusControl from "@/components/ImageFocusControl";

describe("ImageFocusControl", () => {
  it("rendert genau einen vertikalen Slider und ruft onChange mit 50% x auf", () => {
    const onChange = vi.fn();
    render(
      <ImageFocusControl imageSrc="/api/uploads/example.jpg" value="center" onChange={onChange} />
    );

    const slider = screen.getByRole("slider", { name: /Bildfokus/ });
    expect(slider).toBeInTheDocument();
    // Horizontal bleibt fest mittig: x ist immer 50 %.
    fireEvent.change(slider, { target: { value: "30" } });
    expect(onChange).toHaveBeenCalledWith("50% 30%");
  });

  it("zeigt bei fehlendem Bild einen Hinweis", () => {
    render(<ImageFocusControl imageSrc={null} value="center" onChange={() => {}} />);
    expect(screen.getByText("Kein Bild gewählt")).toBeInTheDocument();
  });

  it("wechselt beim Klick auf Mobil die Vorschau-Aspect-Klasse", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ImageFocusControl imageSrc="/api/uploads/example.jpg" value="center" onChange={() => {}} />
    );

    const preview = container.querySelector(".aspect-\\[2\\/1\\]");
    expect(preview).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mobil" }));
    expect(container.querySelector(".aspect-\\[3\\/4\\]")).toBeInTheDocument();
    expect(container.querySelector(".aspect-\\[2\\/1\\]")).not.toBeInTheDocument();
  });
});
