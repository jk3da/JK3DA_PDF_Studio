import { defineConfig } from 'vitest/config'

// Unit-Tests laufen in Node (pdf-lib, zustand, reine Logik). Keine DOM/Electron-Tests.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 20000
  }
})
