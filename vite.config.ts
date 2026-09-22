import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: "fix-punycode-trailing-slash",
        enforce: "pre",
        resolveId(source) {
          if (source === "punycode/") {
            return this.resolve("punycode");
          }
        }
      }
    ]
  }
});
