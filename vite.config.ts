import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import { vitePluginForArco } from '@arco-plugins/vite-vue';
import { VitePWA } from 'vite-plugin-pwa';
// import { visualizer } from 'rollup-plugin-visualizer';

const isDev = process.env.NODE_ENV == 'development';

const base = '/tracker';

export default defineConfig({
  base: base,
  server: {
    port: 8777,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    vue(),
    vitePluginForArco({ style: 'css' }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // devOptions: {
      //   enabled: true,
      // },
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'Tracker Demo',
        short_name: 'tracker',
        description: 'desc',
        theme_color: '#343838',
        display: 'fullscreen',
        start_url: base + '/?from=pwa',
        scope: base,
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css}'],
        navigateFallback: null,
        // 导入外部脚本
        importScripts: ['./sw-custom-headers.js'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:html)/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\.(?:js|css)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'jscss2',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 15 * 86400,
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|ttf|json)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'common',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 30 * 86400,
              },
            },
          },
        ],
      },
    }),
    // visualizer({
    //   open: true,
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  assetsInclude: [],
  css: {
    // 全局导入scss方法
    // preprocessorOptions: {
    //   scss: {
    //     additionalData: '@import "@/styles/mixin.scss";',
    //   },
    // },
    postcss: {
      plugins: [
        // css 前缀补全
        autoprefixer(),
      ],
    },
  },
  build: {
    // css 不拆分文件
    cssCodeSplit: false,
    minify: 'esbuild',
    sourcemap: true,
  },
  esbuild: {
    // 去除console
    drop: isDev ? [] : ['console', 'debugger'],
  },
});
