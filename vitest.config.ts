import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/server/__tests__/**/*.test.ts"],
  },
});
