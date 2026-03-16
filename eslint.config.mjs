import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "_bmad/**",
    "_bmad-output/**",
    "design-artifacts/**",
  ]),
  // 3-Tier Supabase Containment: block @supabase/* imports outside src/lib/supabase/
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@supabase/*"],
              message:
                "Import @supabase/* only in src/lib/supabase/. Use src/lib/data/, src/lib/auth.ts, or src/lib/storage.ts instead.",
            },
          ],
        },
      ],
    },
    ignores: ["src/lib/supabase/**"],
  },
]);

export default eslintConfig;
