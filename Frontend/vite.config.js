import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        // Proxy API calls to backend so no CORS issues in dev
        proxy: {
            "/api": {
                target: "http://localhost:3005",
                changeOrigin: true,
            },
        },
    },
});