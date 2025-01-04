export function promiseRace<T>(iterable: Iterable<T | Promise<T>>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    for (const item of iterable) {
      Promise.resolve(item).then(resolve, reject)
    }
  })
}
