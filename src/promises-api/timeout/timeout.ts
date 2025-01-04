export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout'))
    }, ms)

    promise.then((value) => resolve(value)).catch((err) => reject(err))
  })
}
