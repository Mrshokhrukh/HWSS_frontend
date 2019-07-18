import { defineConfig } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { PrimeVueResolver } from 'unplugin-vue-components/resolvers';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  define: {
    'process.env': process.env
  },
  css: {
    devSourcemap: true,
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        PrimeVueResolver(),
      ],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        PrimeVueResolver(),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
