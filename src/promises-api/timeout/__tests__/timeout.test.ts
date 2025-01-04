import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timeout } from '../timeout.ts'

describe('timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('Должен зарезолвиться когда промис резолвится до истечения таймера', async () => {
    // Промис резолвится через 100 мс
    const fastPromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve('Зарезолвился')
      }, 100)
    })

    // Устанавливаем таймаут в 300 мс
    const result = timeout(fastPromise, 300)

    // Прокручиваем таймер на 100 мс, чтобы промис успел зарезолвиться
    vi.advanceTimersByTime(100)

    // Проверяем, что вернулся результат промиса
    await expect(result).resolves.toBe('Зарезолвился')
  })

  it('Должен зареджектиться когда промис реджектится до истечения таймера', async () => {
    // Промис реджектится через 50 мс
    const failingPromise = new Promise<string>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Boom'))
      }, 50)
    })

    // Устанавливаем таймаут в 300 мс
    const result = timeout(failingPromise, 300)

    // Прокручиваем таймер на 50 мс, чтобы промис успел упасть
    vi.advanceTimersByTime(50)

    // Проверяем, что ошибка — именно "Boom", а не "Timeout"
    await expect(result).rejects.toThrow('Boom')
  })

  it('Должен выбросить ошибку если промис не зарезолвился за указанное количество миллисекунд', async () => {
    // Промис, который никогда не зарезолвится / зареджектится
    const neverEndingPromise = new Promise<string>(() => {})

    // Устанавливаем таймаут в 200 мс
    const result = timeout(neverEndingPromise, 200)

    // Прокручиваем таймер ровно на 200 мс
    vi.advanceTimersByTime(200)

    // Теперь должен сработать reject(new Error('Timeout'))
    await expect(result).rejects.toThrow('Timeout')
  })
})
