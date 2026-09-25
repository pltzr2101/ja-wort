import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GalleryManager from "@/components/GalleryManager";

describe("GalleryManager", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        images: [
          { id: 1, filename: "a.jpg", caption: null, sortOrder: 0 },
          { id: 2, filename: "b.jpg", caption: null, sortOrder: 0 },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("laedt mehrere Bilder in einem einzigen Request hoch", async () => {
    const user = userEvent.setup();
    render(<GalleryManager initial={[]} />);

    const input = screen.getByLabelText(/Bilder/);
    const fileA = new File([new Uint8Array([1, 2, 3])], "a.jpg", { type: "image/jpeg" });
    const fileB = new File([new Uint8Array([4, 5, 6])], "b.jpg", { type: "image/jpeg" });
    await user.upload(input, [fileA, fileB]);

    await user.click(screen.getByRole("button", { name: /Hochladen/ }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/uploads");
    expect(init.method).toBe("POST");
    const formData = init.body as FormData;
    expect(formData.getAll("file")).toHaveLength(2);
  });
});
