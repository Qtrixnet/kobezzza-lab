import { describe, it, expect } from 'vitest'
import { promiseAll } from '../promise-all.ts'

describe('promiseAll', () => {
  it('Должен вернуть пустой массив если вызван с пустым массивом', async () => {
    const customResult = await promiseAll([])
    expect(customResult).toEqual([])

    const nativeResult = await Promise.all([])
    expect(nativeResult).toEqual([])
  })

  it('Должен вернуть результаты всех промисов по порядку', async () => {
    const promise1 = Promise.resolve('first')
    const promise2 = Promise.resolve('second')
    const promise3 = Promise.resolve('third')

    const customResult = await promiseAll([promise1, promise2, promise3])
    expect(customResult).toEqual(['first', 'second', 'third'])

    const nativeResult = await Promise.all([promise1, promise2, promise3])
    expect(nativeResult).toEqual(['first', 'second', 'third'])
  })

  it('Должен зареджектиться если любой из промисов реджектится', async () => {
    const promise1 = Promise.resolve('ok')
    const promise2 = Promise.reject('BOOM')
    const promise3 = Promise.resolve('not reached')

    // Не сохраняем результат в переменную,
    // а сразу проверяем, что общий промис реджектится
    await expect(promiseAll([promise1, promise2, promise3])).rejects.toThrow(
      'BOOM'
    )

    // Не сохраняем результат в переменную,
    // а сразу проверяем, что общий промис реджектится
    await expect(Promise.all([promise1, promise2, promise3])).rejects.toThrow(
      'BOOM'
    )
  })

  it('Должен вернуть не промис значения', async () => {
    const iterable = ['plain value', Promise.resolve('resolved value')]

    const customResult = await promiseAll(iterable)
    expect(customResult).toEqual(['plain value', 'resolved value'])

    const nativeResult = await Promise.all(iterable)
    expect(nativeResult).toEqual(['plain value', 'resolved value'])
  })

  it('Должен вернуть результаты в правильном порядке', async () => {
    const slowPromise = new Promise<string>((resolve) =>
      setTimeout(() => resolve('slow'), 50)
    )
    const fastPromise = Promise.resolve('fast')
    const plainValue = 'plain'

    // Важно: slowPromise завершится последним, но в результате мы всё равно должны увидеть значения в порядке [slowPromise, fastPromise, plainValue]
    const customResult = await promiseAll([
      slowPromise,
      fastPromise,
      plainValue
    ])
    expect(customResult).toEqual(['slow', 'fast', 'plain'])

    const nativeResult = await Promise.all([
      slowPromise,
      fastPromise,
      plainValue
    ])
    expect(nativeResult).toEqual(['slow', 'fast', 'plain'])
  })

  it('Должен корректно обрабатывать Map.values()', async () => {
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

  it('должен корректно работать с Set', async () => {
    const promise1 = Promise.resolve('value 1')
    const promise2 = Promise.resolve('value 2')
    const promise3 = Promise.reject('Rejected!')

    // Важно: Set не гарантирует порядок, так что результат может быть в произвольном порядке.
    const promisesSet = new Set<Promise<string>>([promise1, promise2, promise3])

    await expect(promiseAll(promisesSet)).rejects.toBe('Rejected!')

    await expect(Promise.all(promisesSet)).rejects.toBe('Rejected!')
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

  it('Должен зареджектиться, если в генераторе какой-то промис упал', async () => {
    function* badGenerator() {
      yield Promise.resolve('ok')
      yield Promise.reject('Error in generator')
      yield Promise.resolve('unreached')
    }

    await expect(promiseAll(badGenerator())).rejects.toBe('Error in generator')

    await expect(Promise.all(badGenerator())).rejects.toBe('Error in generator')
  })
})
