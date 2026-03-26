import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  insertLogEntry,
  getLogEntriesByVoyageId,
  getLogEntryById,
  updateLogEntry,
  deleteLogEntry,
} from "./log-entries";

const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    }),
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockFrom.mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
    update: mockUpdate,
    delete: mockDelete,
  });
  mockInsert.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
  });
  mockEq.mockReturnValue({
    order: mockOrder,
    select: mockSelect,
    single: mockSingle,
  });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });
});

describe("insertLogEntry", () => {
  it("should insert a log entry and return it", async () => {
    const entry = {
      id: "le-1",
      voyage_id: "v-1",
      text: "Arrived in Marseille",
      entry_date: "2026-03-20",
    };
    mockSingle.mockReturnValue({ data: entry, error: null });

    const result = await insertLogEntry({
      voyage_id: "v-1",
      text: "Arrived in Marseille",
      entry_date: "2026-03-20",
    });

    expect(mockFrom).toHaveBeenCalledWith("log_entries");
    expect(result.data).toEqual(entry);
    expect(result.error).toBeNull();
  });

  it("should return error on insert failure", async () => {
    mockSingle.mockReturnValue({
      data: null,
      error: { message: "Insert failed" },
    });

    const result = await insertLogEntry({
      voyage_id: "v-1",
      text: "",
      entry_date: "2026-03-20",
    });

    expect(result.error).toBeTruthy();
  });
});

describe("getLogEntriesByVoyageId", () => {
  it("should fetch entries ordered by entry_date descending", async () => {
    const entries = [
      { id: "le-2", entry_date: "2026-03-21" },
      { id: "le-1", entry_date: "2026-03-20" },
    ];
    mockOrder.mockReturnValue({ data: entries, error: null });

    const result = await getLogEntriesByVoyageId("v-1");

    expect(mockFrom).toHaveBeenCalledWith("log_entries");
    expect(mockEq).toHaveBeenCalledWith("voyage_id", "v-1");
    expect(result.data).toEqual(entries);
  });
});

describe("getLogEntryById", () => {
  it("should fetch a single entry by id", async () => {
    const entry = { id: "le-1", text: "Test entry" };
    mockSingle.mockReturnValue({ data: entry, error: null });

    const result = await getLogEntryById("le-1");

    expect(mockFrom).toHaveBeenCalledWith("log_entries");
    expect(mockEq).toHaveBeenCalledWith("id", "le-1");
    expect(result.data).toEqual(entry);
  });

  it("should return error when entry not found", async () => {
    mockSingle.mockReturnValue({
      data: null,
      error: { message: "Not found", code: "PGRST116" },
    });

    const result = await getLogEntryById("nonexistent");

    expect(result.error).toBeTruthy();
  });
});

describe("updateLogEntry", () => {
  it("should update a log entry and return it", async () => {
    const updated = { id: "le-1", text: "Updated text" };
    mockSelect.mockReturnValue({ single: mockSingle });
    mockSingle.mockReturnValue({ data: updated, error: null });

    const result = await updateLogEntry("le-1", { text: "Updated text" });

    expect(mockFrom).toHaveBeenCalledWith("log_entries");
    expect(result.data).toEqual(updated);
  });
});

describe("deleteLogEntry", () => {
  it("should delete a log entry", async () => {
    mockEq.mockReturnValue({ data: null, error: null });

    const result = await deleteLogEntry("le-1");

    expect(mockFrom).toHaveBeenCalledWith("log_entries");
    expect(result.error).toBeNull();
  });
});
