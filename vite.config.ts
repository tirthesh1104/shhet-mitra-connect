import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
// तुमचे बाकीचे existing imports (tailwind, tsconfig-paths वगैरे) तसेच ठेवा

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    react(),
    // तुमचे बाकीचे existing plugins इथे तसेच राहू द्या
  ],
});
