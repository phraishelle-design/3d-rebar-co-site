import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

// Standard TanStack Start Vite setup (no longer depends on the private
// @lovable.dev/vite-tanstack-config wrapper, which is only reachable from
// Lovable's own build sandbox). This keeps the project buildable/deployable
// anywhere a normal Node toolchain is available.
export default defineConfig({
  server: {
    port: 8080,
    host: true,
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts
      // (kept from the original project, wraps SSR errors into a friendly
      // page). Nitro's default preset (plain Node server) is used for
      // `vite build` — see README "Deployment" for why that matters for
      // the CMS's file-based content/media storage.
      server: { entry: "server" },
    }),
    viteReact(),
  ],
});
