import type { Jk3daApi } from './index'

declare global {
  interface Window {
    jk3da: Jk3daApi
  }
}

export {}
