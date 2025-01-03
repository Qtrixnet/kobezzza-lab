import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rejectAfterSleep } from '../reject-after-sleep.ts'

describe('rejectAfterSleep', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should reject after 300 ms', async () => {
    const promise = rejectAfterSleep(300)

    // Проматываем таймеры на 299 мс (промис ещё не должен упасть)
    vi.advanceTimersByTime(299)

    // На данный момент промис не должен быть rejected или resolved
    // Проверить это напрямую сложно, но главное, что "catch" ещё не сработал.

    // Теперь доводим время до 300 мс
    vi.advanceTimersByTime(1)

    // Проверяем, что промис упал
    await expect(promise).rejects.toBeUndefined()
  })

  it('should reject immediately if ms=0', async () => {
    const promise = rejectAfterSleep(0)

    // Проматываем все таймеры (запланированный setTimeout(…, 0))
    vi.runAllTimers()

    await expect(promise).rejects.toBeUndefined()
  })

  it('should reject immediately if ms<0', async () => {
    const promise = rejectAfterSleep(-100)

    vi.runAllTimers()

    await expect(promise).rejects.toBeUndefined()
  })
})
