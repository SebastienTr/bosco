import { describe, expect, it } from "vitest";
import { getSupabaseEnv } from "./config";

function createEnv(overrides: Record<string, string>): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "test",
    ...overrides,
  };
}

describe("getSupabaseEnv", () => {
  it("returns null when the publishable key is missing", () => {
    expect(
      getSupabaseEnv(createEnv({
        NEXT_PUBLIC_SUPABASE_DB_URL: "http://127.0.0.1:54321",
      })),
    ).toBeNull();
  });

  it("returns null when the publishable key is blank", () => {
    expect(
      getSupabaseEnv(createEnv({
        NEXT_PUBLIC_SUPABASE_DB_PUBLISHABLE_KEY: "   ",
        NEXT_PUBLIC_SUPABASE_DB_URL: "http://127.0.0.1:54321",
      })),
    ).toBeNull();
  });

  it("returns null when the publishable key is still the placeholder", () => {
    expect(
      getSupabaseEnv(createEnv({
        NEXT_PUBLIC_SUPABASE_DB_PUBLISHABLE_KEY: "your-publishable-key-here",
        NEXT_PUBLIC_SUPABASE_DB_URL: "http://127.0.0.1:54321",
      })),
    ).toBeNull();
  });

  it("returns the normalized values when the env is complete", () => {
    expect(
      getSupabaseEnv(createEnv({
        NEXT_PUBLIC_SUPABASE_DB_PUBLISHABLE_KEY: " sb_publishable_test ",
        NEXT_PUBLIC_SUPABASE_DB_URL: " http://127.0.0.1:54321 ",
      })),
    ).toEqual({
      publishableKey: "sb_publishable_test",
      url: "http://127.0.0.1:54321",
    });
  });
});
