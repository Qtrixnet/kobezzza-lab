export const rejectAfterSleep = (ms: number): Promise<void> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject()
    }, ms)
  })
}
