import { defineConfig, Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";

function htmlPartialPlugin(): Plugin {
  return {
    name: "html-partial-plugin",
    transformIndexHtml(html: string): string {
      return html.replace(/<include\s+src="([^"]+)"\s*><\/include>/g, (_match, src: string) => {
        const filePath = path.resolve(__dirname, src);
        if (fs.existsSync(filePath)) {
          return fs.readFileSync(filePath, "utf-8");
        }
        return `<!-- Missing include: ${src} -->`;
      });
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith(".html")) {
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [htmlPartialPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
