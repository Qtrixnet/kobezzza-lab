import { describe, it, expect } from 'vitest'
import { promiseAllSettled } from '../promise-all-settled.ts'
import { promiseAll } from '../../promise-all/promise-all.ts'

describe('promiseAllSettled', () => {
  it('Должен вернуть пустой массив если вызван с пустым массивом', async () => {
    const customResult = await promiseAllSettled([])
    expect(customResult).toEqual([])

    const nativeResult = await Promise.allSettled([])
    expect(nativeResult).toEqual([])
  })

  it('Должен возвращать fulfilled для всех элементов, если все успешны', async () => {
    const promise1 = Promise.resolve('value 1')
    const plainValue = 'value 2' // обычное значение
    const promise2 = Promise.resolve('value 3')

    const customResult = await promiseAllSettled([
      promise1,
      plainValue,
      promise2
    ])
    expect(customResult).toEqual([
      { status: 'fulfilled', value: 'value 1' },
      { status: 'fulfilled', value: 'value 2' },
      { status: 'fulfilled', value: 'value 3' }
    ])

    const nativeResult = await Promise.allSettled([
      promise1,
      plainValue,
      promise2
    ])
    expect(nativeResult).toEqual([
      { status: 'fulfilled', value: 'value 1' },
      { status: 'fulfilled', value: 'value 2' },
      { status: 'fulfilled', value: 'value 3' }
    ])
  })

  it('Должен возвращать mixed (и fulfilled, и rejected), если некоторые элементы падают', async () => {
    const promise1 = Promise.resolve('fine')
    const promise2 = Promise.reject('Oops')
    const promise3 = Promise.resolve('still fine')

    const customResult = await promiseAllSettled([promise1, promise2, promise3])
    expect(customResult).toEqual([
      { status: 'fulfilled', value: 'fine' },
      { status: 'rejected', reason: 'Oops' },
      { status: 'fulfilled', value: 'still fine' }
    ])

    const nativeResult = await Promise.allSettled([
      promise1,
      promise2,
      promise3
    ])
    expect(nativeResult).toEqual([
      { status: 'fulfilled', value: 'fine' },
      { status: 'rejected', reason: 'Oops' },
      { status: 'fulfilled', value: 'still fine' }
    ])
  })

  it('Должен сохранять результаты в правильном порядке, даже если промисы завершаются не по порядку', async () => {
    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('slow'), 50)
    })
    const fastPromise = Promise.resolve('fast')
    const plainValue = 'plain'

    // Важно: slowPromise завершится последним, но в результате мы всё равно должны увидеть значения в порядке [slowPromise, fastPromise, plainValue]
    const customResult = await promiseAllSettled([
      slowPromise,
      fastPromise,
      plainValue
    ])
    expect(customResult).toEqual([
      { status: 'fulfilled', value: 'slow' },
      { status: 'fulfilled', value: 'fast' },
      { status: 'fulfilled', value: 'plain' }
    ])

    const nativeResult = await Promise.allSettled([
      slowPromise,
      fastPromise,
      plainValue
    ])
    expect(nativeResult).toEqual([
      { status: 'fulfilled', value: 'slow' },
      { status: 'fulfilled', value: 'fast' },
      { status: 'fulfilled', value: 'plain' }
    ])
  })

  it('должен корректно работать с Set', async () => {
    const promise1 = Promise.resolve('value 1')
    const promise2 = Promise.reject('Rejected!')
    const plainValue = 'value 3'

    // Важно: Set не гарантирует порядок, так что результат может быть в произвольном порядке.
    const set = new Set([promise1, promise2, plainValue])

    await expect(promiseAll(set)).rejects.toBe('Rejected!')

    await expect(Promise.all(set)).rejects.toBe('Rejected!')
  })

  it('должен обрабатывать Map.values()', async () => {
    const promise1 = Promise.resolve('value 1')
    const promise2 = new Promise<string>((resolve) =>
      setTimeout(resolve, 50, 'value 2')
    )
    const promise3 = Promise.reject('Rejected!')

    const promisesMap = new Map<string, Promise<string>>([
      ['key1', promise1],
      ['key2', promise2],
      ['key3', promise3]
    ])

    await expect(promiseAll(promisesMap.values())).rejects.toBe('Rejected!')

    await expect(Promise.all(promisesMap.values())).rejects.toBe('Rejected!')
  })

  it('Должен сохранить порядок при использовании генератора (iterable)', async () => {
    // Пример своего итерируемого объекта: генератор
    function* generator() {
      yield Promise.resolve('value 1')
      yield 'value 2' // Обычное значение, обернётся в Promise.resolve
      yield new Promise<string>((resolve) => {
        setTimeout(() => resolve('value 3'), 10)
      })
    }

    const customResult = await promiseAll(generator())

    expect(customResult).toEqual(['value 1', 'value 2', 'value 3'])

    const nativeResult = await Promise.all(generator())

    expect(nativeResult).toEqual(['value 1', 'value 2', 'value 3'])
  })
})
