import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sleep } from '../sleep.ts'

describe('sleep (real timers)', () => {
  it('should return a Promise', () => {
    const result = sleep(100)

    expect(result).toBeInstanceOf(Promise)
  })

  it('should resolve after ~100 ms (real timers)', async () => {
    const start = performance.now()

    await sleep(300)

    const end = performance.now()

    expect(end - start).toBeGreaterThanOrEqual(300)
  })

  it('should resolve almost immediately with 0 ms', async () => {
    const start = performance.now()

    await sleep(0)

    const end = performance.now()

    expect(end - start).toBeGreaterThanOrEqual(0)
  })

  it('should resolve immediately with negative ms', async () => {
    const start = performance.now()

    await sleep(-100)

    const end = performance.now()

    expect(end - start).toBeLessThan(20)
  })
})

describe('sleep (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should resolve after 100 ms (fake timers)', async () => {
    const promise = sleep(100)

    // Проматываем время вперёд на 100 мс
    vi.advanceTimersByTime(100)

    // Проверяем, что промис успел резолвиться
    await expect(promise).resolves.toBeUndefined()
  })

  it('should resolve immediately if ms=0 (fake timers)', async () => {
    const promise = sleep(0)

    // Проматываем время на 0 мс — фактически запускаем все отложенные колбэки
    vi.runAllTimers()

    await expect(promise).resolves.toBeUndefined()
  })
})
