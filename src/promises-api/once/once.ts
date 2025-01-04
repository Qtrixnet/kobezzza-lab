export const once = (
  element: HTMLElement,
  eventName: string
): Promise<Event> => {
  return new Promise((resolve) => {
    element.addEventListener(eventName, resolve, { once: true })
  })
}
