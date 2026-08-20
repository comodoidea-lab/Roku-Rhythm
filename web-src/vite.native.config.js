import { defineConfig } from "vite";

// Capacitor only needs the compiled web bundle. Keeping PWA generation out of
// this path avoids touching the existing public PWA release configuration.
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
