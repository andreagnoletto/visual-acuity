import { defineVitestConfig } from '@nuxt/test-utils/config';
import { resolve } from 'path';

export default defineVitestConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.ts']
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './app'),
      '~/': resolve(__dirname, './app/')
    }
  }
});

