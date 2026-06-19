import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Gemockte Client-Schicht (localStorage + API).
type MockSave = {
  status: "saved" | "conflict" | "unauthorized" | "error";
  draft?: { id: string; updated_at: string };
};
const client = vi.hoisted(() => ({
  writeLocalDraft: vi.fn<(...a: unknown[]) => boolean>(() => true),
  clearLocalDraft: vi.fn(),
  deleteServerDraft: vi.fn(async () => true),
  saveServerDraft: vi.fn<(...a: unknown[]) => Promise<MockSave>>(async () => ({
    status: "saved",
    draft: { id: "d1", updated_at: "t1" },
  })),
}));
vi.mock("@/lib/drafts/client", () => client);

import { useDraftAutosave } from "./useDraftAutosave";

const flush = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  vi.useFakeTimers();
  client.writeLocalDraft.mockClear().mockReturnValue(true);
  client.clearLocalDraft.mockClear();
  client.deleteServerDraft.mockClear().mockResolvedValue(true);
  client.saveServerDraft
    .mockClear()
    .mockResolvedValue({ status: "saved", draft: { id: "d1", updated_at: "t1" } });
});
afterEach(() => vi.useRealTimers());

function setup(mode: "local" | "server") {
  return renderHook(() =>
    useDraftAutosave({ formId: "flexcover", mode, debounceMs: 2000 }),
  );
}

describe("useDraftAutosave", () => {
  it("ignoriert die erste Meldung (geladener Zustand → kein Speichern)", async () => {
    const { result } = setup("local");
    act(() => result.current.notify({ a: 1 }, "A"));
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(client.writeLocalDraft).not.toHaveBeenCalled();
  });

  it("anonym: speichert debounced in localStorage nach einer Änderung", async () => {
    const { result } = setup("local");
    act(() => result.current.notify({ a: 1 }, "A")); // Basis
    act(() => result.current.notify({ a: 2 }, "A")); // Änderung
    expect(client.writeLocalDraft).not.toHaveBeenCalled(); // noch nicht (debounce)
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(client.writeLocalDraft).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("saved");
  });

  it("eingeloggt: speichert über die API und merkt sich den Zeitstempel", async () => {
    const { result } = setup("server");
    act(() => result.current.notify({ a: 1 }, "A"));
    act(() => result.current.notify({ a: 2 }, "A"));
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(client.saveServerDraft).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("saved");
    expect(result.current.lastSavedAt).toBe("t1");
  });

  it("eingeloggt: Konflikt → Status 'stale' + Konflikt-Stand", async () => {
    client.saveServerDraft.mockResolvedValue({
      status: "conflict",
      draft: { id: "d9", updated_at: "t9" },
    });
    const { result } = setup("server");
    act(() => result.current.notify({ a: 1 }, "A"));
    act(() => result.current.notify({ a: 2 }, "A"));
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(result.current.status).toBe("stale");
    expect(result.current.conflictDraft?.id).toBe("d9");
  });

  it("manuelles Speichern wirkt sofort (ohne Debounce)", async () => {
    const { result } = setup("local");
    act(() => result.current.notify({ a: 1 }, "A"));
    act(() => result.current.notify({ a: 2 }, "A"));
    await act(async () => {
      result.current.save();
      await flush();
    });
    expect(client.writeLocalDraft).toHaveBeenCalledTimes(1);
  });

  it("Verwerfen: löscht und setzt Status zurück", async () => {
    const { result } = setup("server");
    await act(async () => { await result.current.discard(); });
    expect(client.deleteServerDraft).toHaveBeenCalledWith("flexcover");
    expect(client.clearLocalDraft).toHaveBeenCalledWith("flexcover", null);
    expect(result.current.status).toBe("idle");
  });

  it("localStorage nicht verfügbar → Status error", async () => {
    client.writeLocalDraft.mockReturnValue(false);
    const { result } = setup("local");
    act(() => result.current.notify({ a: 1 }, "A"));
    act(() => result.current.notify({ a: 2 }, "A"));
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(result.current.status).toBe("error");
    expect(result.current.localUnavailable).toBe(true);
  });
});
