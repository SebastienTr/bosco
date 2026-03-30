import { describe, expect, it } from "vitest";
import {
  getSupabaseAdminEnv,
  getSupabaseEnv,
} from "./config";

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

describe("getSupabaseAdminEnv", () => {
  it("returns null when the service role key is missing", () => {
    expect(
      getSupabaseAdminEnv(createEnv({
        NEXT_PUBLIC_SUPABASE_DB_URL: "http://127.0.0.1:54321",
      })),
    ).toBeNull();
  });

  it("returns null when the service role key is still the placeholder", () => {
    expect(
      getSupabaseAdminEnv(createEnv({
        SUPABASE_SERVICE_ROLE_KEY: "your-service-role-key-here",
      })),
    ).toBeNull();
  });

  it("returns the normalized service role key when present", () => {
    expect(
      getSupabaseAdminEnv(createEnv({
        SUPABASE_SERVICE_ROLE_KEY: " sb_service_role_test ",
      })),
    ).toEqual({
      serviceRoleKey: "sb_service_role_test",
    });
  });
});
