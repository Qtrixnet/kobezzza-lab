import { describe, it, expect } from 'vitest'
import { once } from '../once.ts'

describe('once', () => {
  it('Должен зарезолвиться при первом клике', async () => {
    const button = document.createElement('button')
    button.id = 'test-button'
    document.body.appendChild(button)

    const oncePromise = once(button, 'click')

    const clickEvent = new MouseEvent('click', { bubbles: true })
    button.dispatchEvent(clickEvent)

    const event = await oncePromise
    expect(event).toBeInstanceOf(MouseEvent)
  })

  it('Не должен срабатывать повторно при втором клике', async () => {
    const button = document.createElement('button')

    const oncePromise = once(button, 'click')

    let timesResolved = 0

    oncePromise.then(() => {
      timesResolved++
    })

    button.dispatchEvent(new MouseEvent('click'))
    await oncePromise
    expect(timesResolved).toBe(1)

    button.dispatchEvent(new MouseEvent('click'))
    await new Promise((r) => setTimeout(r, 50))

    expect(timesResolved).toBe(1)
  })
})
