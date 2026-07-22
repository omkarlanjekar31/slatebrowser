import { defineConfig } from "electron-vite";
import { resolve } from "path";

export default defineConfig({
  preload: {
    build: {
      // tell Vite to bundle preload scripts
      rollupOptions: {
        input: {
          preload: resolve(__dirname, "src/electron/preloadweb.cts"),
        }
      },
      // ensures full bundling of dependencies (like bip39)
      externalizeDeps: false,
    },
  },
});
