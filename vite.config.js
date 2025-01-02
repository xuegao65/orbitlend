import { defineConfig } from "vite";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      assert: "assert",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify",
      url: "url",
      buffer: "buffer",
      fs: false,
      path: false,
    },
  },
  define: {
    "process.env": {},
    global: "globalThis",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      supported: { bigint: true },
    },
    include: [
      "@project-serum/serum",
      "buffer",
      "crypto-browserify",
      "stream-browserify",
      "@ant-design/web3-solana",
    ],
  },
  build: {
    target: "esnext",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "solana-vendor": ["@solana/web3.js", "@solana/wallet-adapter-react"],
        },
      },
    },
  },
  server: {
    host: true,
    port: 3000,
  },
});
