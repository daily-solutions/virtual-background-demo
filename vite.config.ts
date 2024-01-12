import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import eslint from "vite-plugin-eslint";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  server: { https: true }, // Not needed for Vite 5+
  plugins: [mkcert(), react(), eslint()],
});
