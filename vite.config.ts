import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  server: { https: true }, // Not needed for Vite 5+
  plugins: [mkcert(), react(), eslint()],
});
