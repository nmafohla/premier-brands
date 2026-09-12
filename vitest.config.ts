import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "tests",
    environment: "node",
    globals: true,
    watch: false,
    fileParallelism: false,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
