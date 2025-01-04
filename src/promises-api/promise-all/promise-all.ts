export const promiseAll = <T>(
  iterable: Iterable<T | Promise<T>>
): Promise<T[]> => {
  return new Promise<T[]>((resolve, reject) => {
    // Превращаем итерируемый объект (Set, Map.values(), генератор и т.д.) в массив
    const itemsList = Array.from(iterable)

    // Если передан пустой массив (или пустой итерируемый объект),
    // сразу резолвим пустым массивом.
    if (itemsList.length === 0) {
      resolve([])
      return
    }

    const results = new Array<T>(itemsList.length)
    let resolvedCount = 0

    itemsList.forEach((item, index) => {
      // Оборачиваем каждый элемент в Promise.resolve на случай если это не промис
      Promise.resolve(item)
        .then((value) => {
          results[index] = value
          resolvedCount++

          // Когда все элементы обработаны
          if (resolvedCount === itemsList.length) {
            resolve(results)
          }
        })
        .catch((err) => {
          // Если хотя бы один элемент упал — общий промис сразу реджектится
          reject(err)
        })
    })
  })
}
