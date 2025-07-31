import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 禁用並行測試，確保測試按順序執行
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    // 設置測試超時時間
    testTimeout: 10000,
    // 設置 hook 超時時間
    hookTimeout: 10000,
    // 設置默認不使用 watch 模式
    watch: false
  }
})
