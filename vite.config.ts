import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    allowedHosts: [
      // Allow Cloudflare Tunnel host
       '*',
      // If you want to allow *any* tunnel host, replace the above with:
      // '*'
    ],
  },
  build: {
    // Performance optimizations
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 500,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Optimize chunking for better caching and smaller initial load
        manualChunks: (id) => {
          // Core vendor chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // Router chunk
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // Supabase chunk
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // Animation libraries
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) {
            return 'vendor-animation';
          }
          // UI components (Radix)
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-ui';
          }
          // Charts
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          // Three.js / 3D
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'vendor-3d';
          }
          // PDF processing
          if (id.includes('node_modules/pdfjs-dist') || id.includes('node_modules/jspdf') || id.includes('node_modules/react-pdf')) {
            return 'vendor-pdf';
          }
          // Markdown
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark')) {
            return 'vendor-markdown';
          }
          // Other node_modules go to a general vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-common';
          }
        },
        // Asset file names with hash for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
});
