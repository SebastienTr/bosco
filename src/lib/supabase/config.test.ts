import { describe, expect, it } from "vitest";
import { getSupabaseEnv } from "./config";

function createEnv(overrides: Record<string, string>): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "test",
    ...overrides,
  };
}

describe("getSupabaseEnv", () => {
  it("returns null when the anon key is missing", () => {
    expect(
      getSupabaseEnv(createEnv({
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      })),
    ).toBeNull();
  });

  it("returns null when the anon key is blank", () => {
    expect(
      getSupabaseEnv(createEnv({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "   ",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      })),
    ).toBeNull();
  });

  it("returns null when the anon key is still the placeholder", () => {
    expect(
      getSupabaseEnv(createEnv({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "your-anon-key-here",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      })),
    ).toBeNull();
  });

  it("returns the normalized values when the env is complete", () => {
    expect(
      getSupabaseEnv(createEnv({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: " anon-key ",
        NEXT_PUBLIC_SUPABASE_URL: " http://127.0.0.1:54321 ",
      })),
    ).toEqual({
      anonKey: "anon-key",
      url: "http://127.0.0.1:54321",
    });
  });
});
