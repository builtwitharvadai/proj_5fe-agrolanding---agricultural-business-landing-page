import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base path for GitHub Pages deployment
  base: './',

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    
    // Asset directory within outDir
    assetsDir: 'assets',
    
    // Generate source maps for production debugging
    sourcemap: true,
    
    // Target modern browsers for optimal output
    target: 'es2020',
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Rollup options for advanced bundling
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('vite')) {
              return 'vite-vendor';
            }
            return 'vendor';
          }
          
          // Utility chunks
          if (id.includes('src/utils')) {
            return 'utils';
          }
          
          // Component chunks
          if (id.includes('src/components')) {
            return 'components';
          }
        },
        
        // Asset naming patterns
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|webp|avif/i.test(ext)) {
            return 'images/[name]-[hash][extname]';
          }
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return 'fonts/[name]-[hash][extname]';
          }
          if (/css/i.test(ext)) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: true,
    
    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
    
    // Emit manifest for asset tracking
    manifest: true,
    
    // Asset inlining threshold (4kb)
    assetsInlineLimit: 4096,
    
    // Enable CSS minification
    cssMinify: true,
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
    strictPort: false,
    
    // CORS configuration
    cors: true,
    
    // HMR configuration
    hmr: {
      overlay: true,
    },
  },

  // Preview server configuration (for production build testing)
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
    open: true,
  },

  // Dependency optimization
  optimizeDeps: {
    include: [],
    exclude: [],
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.json', '.html'],
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },

  // Public directory
  publicDir: 'public',

  // Clear screen on rebuild
  clearScreen: true,

  // Log level
  logLevel: 'info',
});