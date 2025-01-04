import { describe, it, expect } from 'vitest'
import { promiseRace } from '../promise-race.ts'

describe('promiseRace', () => {
  it('Должен остаться в состоянии pending, если передан пустой итерируемый объект', async () => {
    // Проверить «бесконечное ожидание» напрямую сложно,
    const customRacePromise = promiseRace([])
    const nativeRacePromise = Promise.race([])

    const customResult = {
      isFinished: false,
      result: undefined
    }

    const nativeResult = {
      isFinished: false,
      result: undefined
    }

    // Навесим then/catch, чтобы отследить, завершился ли промис
    customRacePromise
      .then((val) => {
        customResult.isFinished = true
        customResult.result = val
      })
      .catch((err) => {
        customResult.isFinished = true
        customResult.result = err
      })

    nativeRacePromise
      .then((val) => {
        nativeResult.isFinished = true
        nativeResult.result = val
      })
      .catch((err) => {
        nativeResult.isFinished = true
        nativeResult.result = err
      })

    // Подождём 100 мс и проверим, что промис не зарезолвился / не зареджектился
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(customResult.isFinished).toBe(false)
    expect(customResult.result).toBeUndefined()

    expect(nativeResult.isFinished).toBe(false)
    expect(nativeResult.result).toBeUndefined()
  })

  it('Должен зарезолвиться значением самого быстрого (первого) промиса', async () => {
    const promise1 = new Promise<string>((resolve) =>
      setTimeout(() => resolve('Value 1'), 100)
    )
    const promise2 = new Promise<string>((resolve) =>
      setTimeout(() => resolve('Value 2'), 200)
    )

    const customResult = await promiseRace([promise1, promise2])
    expect(customResult).toBe('Value 1')

    const nativeResult = await Promise.race([promise1, promise2])
    expect(nativeResult).toBe('Value 1')
  })

  it('Должен зареджектиться ошибкой, если первый «финишировавший» промис упадёт', async () => {
    const promise1 = new Promise((_, reject) =>
      setTimeout(() => reject('Third Rejected'), 50)
    )
    const promise2 = new Promise((resolve) =>
      setTimeout(() => resolve('First'), 100)
    )
    const promise3 = new Promise((resolve) =>
      setTimeout(() => resolve('Second'), 200)
    )

    await expect(promiseRace([promise1, promise2, promise3])).rejects.toBe(
      'Third Rejected'
    )

    await expect(Promise.race([promise1, promise2, promise3])).rejects.toBe(
      'Third Rejected'
    )
  })

  it('Должен зарезолвиться мгновенно, если значение — не промис', async () => {
    const plainValue = 'instant'
    const promise = new Promise((resolve) =>
      setTimeout(() => resolve('delayed'), 100)
    )

    const customResult = await promiseRace([plainValue, promise])
    expect(customResult).toBe('instant')

    const nativeResult = await Promise.race([plainValue, promise])
    expect(nativeResult).toBe('instant')
  })

  it('Должен корректно работать с Set (iterable)', async () => {
    const set = new Set([
      new Promise<string>((resolve) => setTimeout(() => resolve('later'), 50)),
      Promise.resolve('now')
    ])

    const customResult = await promiseRace(set)
    expect(customResult).toBe('now')

    const nativeResult = await Promise.race(set)
    expect(nativeResult).toBe('now')
  })

  it('Должен корректно работать с Map.values()', async () => {
    const map = new Map<string, Promise<string>>([
      [
        'key1',
        new Promise((resolve) => setTimeout(() => resolve('slow'), 100))
      ],
      ['key2', Promise.resolve('fast')]
    ])

    const customResult = await promiseRace(map.values())
    expect(customResult).toBe('fast')

    const nativeResult = await promiseRace(map.values())
    expect(nativeResult).toBe('fast')
  })

  it('Должен корректно работать с генератором (iterable)', async () => {
    function* generator() {
      yield Promise.resolve('A')
      yield new Promise<string>((resolve) => setTimeout(() => resolve('B'), 20))
      yield new Promise<string>((resolve) => setTimeout(() => resolve('C'), 10))
    }

    const customResult = await promiseRace(generator())
    expect(customResult).toBe('A')

    const nativeResult = await promiseRace(generator())
    expect(nativeResult).toBe('A')
  })
})
