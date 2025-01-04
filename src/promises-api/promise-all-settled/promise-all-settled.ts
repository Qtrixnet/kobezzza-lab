export const promiseAllSettled = <T>(
  iterable: Iterable<T | Promise<T>>
): Promise<
  (
    | { status: 'fulfilled'; value: T }
    | { status: 'rejected'; reason: unknown }
  )[]
> => {
  return new Promise((resolve) => {
    // Превращаем итерируемый объект (Set, Map.values(), генератор и т.д.) в массив
    const itemsList = Array.from(iterable)

    // Если передан пустой набор — сразу возвращаем пустой массив
    if (itemsList.length === 0) {
      resolve([])
      return
    }

    const results = new Array<
      | { status: 'fulfilled'; value: T }
      | { status: 'rejected'; reason: unknown }
    >(itemsList.length)
    let settledCount = 0

    itemsList.forEach((item, index) => {
      Promise.resolve(item)
        .then((value) => {
          results[index] = {
            status: 'fulfilled',
            value
          }
        })
        .catch((error) => {
          results[index] = {
            status: 'rejected',
            reason: error
          }
        })
        .finally(() => {
          settledCount++

          if (settledCount === itemsList.length) {
            resolve(results)
          }
        })
    })
  })
}
