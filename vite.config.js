import { defineConfig } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { PrimeVueResolver } from 'unplugin-vue-components/resolvers';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default defineConfig({
  css: {
    devSourcemap: true,
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        PrimeVueResolver(),
      ],
    }),
    Components({
      resolvers: [
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
