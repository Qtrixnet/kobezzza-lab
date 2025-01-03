import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sleep } from '../sleep.ts'

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should resolve after 1000 ms', async () => {
    const promise = sleep(1000)

    // Проматываем время вперёд на 1000 мс
    vi.advanceTimersByTime(1000)

    // Проверяем, что промис успел зарезолвиться
    await expect(promise).resolves.toBeUndefined()
  })

  it('should resolve immediately if ms=0', async () => {
    const promise = sleep(0)

    // Запускаем все таймеры (по факту с 0 задержкой)
    vi.runAllTimers()

    await expect(promise).resolves.toBeUndefined()
  })

  it('should resolve immediately if ms<0', async () => {
    const promise = sleep(-100)

    // При отрицательном числе setTimeout сработает как 0
    vi.runAllTimers()

    await expect(promise).resolves.toBeUndefined()
  })
})
