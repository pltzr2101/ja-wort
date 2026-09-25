import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RsvpForm from "@/components/RsvpForm";

describe("RsvpForm", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("blendet bedingte Felder erst bei Zusage ein", async () => {
    const user = userEvent.setup();
    render(<RsvpForm locale="de" />);

    expect(screen.getByLabelText(/Vor- und Nachname/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Personenzahl/)).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /Sind Kinder/ })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Zu- oder Absage/), "yes");

    expect(screen.getByLabelText(/Personenzahl/)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /Sind Kinder/ })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /Unterkunft/ })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Alter der Kinder/)).not.toBeInTheDocument();
  });

  it("blendet das Kinder-Alter erst bei 'Kinder = Ja' ein", async () => {
    const user = userEvent.setup();
    render(<RsvpForm locale="de" />);

    await user.selectOptions(screen.getByLabelText(/Zu- oder Absage/), "yes");

    const childrenGroup = screen.getByRole("group", { name: /Sind Kinder/ });
    await user.click(within(childrenGroup).getByRole("radio", { name: "Ja" }));

    expect(screen.getByLabelText(/Alter der Kinder/)).toBeInTheDocument();
    expect(screen.getByText(/Hochstühle und Kindermenüs planen/)).toBeInTheDocument();
  });

  it("sendet bei Zusage den vollstaendigen Payload", async () => {
    const user = userEvent.setup();
    render(<RsvpForm locale="de" />);

    await user.type(screen.getByLabelText(/Vor- und Nachname/), "Max Mustermann");
    await user.selectOptions(screen.getByLabelText(/Zu- oder Absage/), "yes");
    await user.selectOptions(screen.getByLabelText(/Personenzahl/), "2");

    const childrenGroup = screen.getByRole("group", { name: /Sind Kinder/ });
    await user.click(within(childrenGroup).getByRole("radio", { name: "Ja" }));
    await user.type(screen.getByLabelText(/Alter der Kinder/), "2 und 5");

    const stayGroup = screen.getByRole("group", { name: /Unterkunft/ });
    await user.click(within(stayGroup).getByRole("radio", { name: "Nein" }));

    await user.click(screen.getByRole("button", { name: /Absenden/ }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/rsvp");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      name: "Max Mustermann",
      attending: "yes",
      guests: 2,
      hasChildren: true,
      childrenAges: "2 und 5",
      needsAccommodation: false,
    });
  });

  it("zeigt bei mehr als einer Person ein Feld fuer weitere Namen", async () => {
    const user = userEvent.setup();
    render(<RsvpForm locale="de" />);

    await user.selectOptions(screen.getByLabelText(/Zu- oder Absage/), "yes");
    // Bei einer Person kein Zusatzfeld.
    await user.selectOptions(screen.getByLabelText(/Personenzahl/), "1");
    expect(screen.queryByLabelText(/weiteren Personen/)).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Personenzahl/), "3");
    expect(screen.getByLabelText(/weiteren Personen/)).toBeInTheDocument();
  });

  it("sendet die Namen weiterer Personen mit", async () => {
    const user = userEvent.setup();
    render(<RsvpForm locale="de" />);

    await user.type(screen.getByLabelText(/Vor- und Nachname/), "Max Mustermann");
    await user.selectOptions(screen.getByLabelText(/Zu- oder Absage/), "yes");
    await user.selectOptions(screen.getByLabelText(/Personenzahl/), "3");
    await user.type(screen.getByLabelText(/weiteren Personen/), "Anna Musterfrau, Ben Beispiel");

    const childrenGroup = screen.getByRole("group", { name: /Sind Kinder/ });
    await user.click(within(childrenGroup).getByRole("radio", { name: "Nein" }));

    await user.click(screen.getByRole("button", { name: /Absenden/ }));

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.additionalNames).toBe("Anna Musterfrau, Ben Beispiel");
  });

  it("sendet bei Absage keine bedingten Felder", async () => {
    const user = userEvent.setup();
    render(<RsvpForm locale="de" />);

    await user.type(screen.getByLabelText(/Vor- und Nachname/), "Erika Beispiel");
    await user.selectOptions(screen.getByLabelText(/Zu- oder Absage/), "no");
    await user.click(screen.getByRole("button", { name: /Absenden/ }));

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      name: "Erika Beispiel",
      attending: "no",
      guests: null,
      hasChildren: null,
      childrenAges: null,
      needsAccommodation: null,
    });
  });
});
