import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    environmentMatchGlobs: [["**/*.test.tsx", "jsdom"]],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
      exclude: [
        ".next/",
        "**/*.config.js",
        "**/*.d.ts",
        "**/types.ts",
        "eslint.config.js",
        "instrumentation.ts",
        "middleware.ts",
        "next-env.d.ts",
        "next.config.js",
        "node_modules/",
        "pages/api/**",
        "postcss.config.js",
        "tailwind.config.js",
        "vitest.config.ts",
        "vitest.setup.ts",
      ],
    },
  },
});
