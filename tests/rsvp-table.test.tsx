import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RsvpTable from "@/components/RsvpTable";
import type { RsvpRow } from "@/lib/rsvps";

const { mockRouter } = vi.hoisted(() => ({ mockRouter: { refresh: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }));

const rows: RsvpRow[] = [
  {
    id: 1,
    name: "Max Mustermann",
    attending: true,
    guests: 2,
    hasChildren: false,
    childrenAges: null,
    needsAccommodation: false,
    note: null,
    createdAt: "2026-09-01 10:00:00",
  },
  {
    id: 2,
    name: "Erika Beispiel",
    attending: false,
    guests: null,
    hasChildren: null,
    childrenAges: null,
    needsAccommodation: null,
    note: null,
    createdAt: "2026-09-02 10:00:00",
  },
];

describe("RsvpTable", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    global.fetch = fetchMock as unknown as typeof fetch;
    mockRouter.refresh.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("zeigt eine Bestaetigung und loescht bei Bestaetigung", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<RsvpTable initial={rows} />);

    await user.click(screen.getByRole("button", { name: /Anmeldung von Max Mustermann/ }));

    expect(confirmSpy).toHaveBeenCalledWith("Möchtest du diese Anmeldung wirklich löschen?");
    expect(fetchMock).toHaveBeenCalledWith("/api/rsvp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1 }),
    });
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("loescht nicht, wenn die Bestaetigung abgebrochen wird", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<RsvpTable initial={rows} />);

    await user.click(screen.getByRole("button", { name: /Anmeldung von Max Mustermann/ }));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
