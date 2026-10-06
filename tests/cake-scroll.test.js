import { describe, it, expect, beforeEach, vi } from 'vitest'

function mockMatchMedia(reduce) {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: q.includes('no-preference') ? !reduce : q.includes(': reduce') ? reduce : false,
    media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }))
}

beforeEach(() => {
  vi.resetModules()
  document.body.innerHTML = '<section id="inicio"><div class="cake-layer"><img class="cake"></div></section><section id="cardapio"></section>'
})

describe('initCakeScroll', () => {
  it('com movimento: fixa o bolo', async () => {
    mockMatchMedia(false)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    initCakeScroll()
    expect(document.querySelector('.cake-layer').classList.contains('is-fixed')).toBe(true)
  })
  it('com movimento: ancora o bolo fixo na posicao estatica (custom properties)', async () => {
    mockMatchMedia(false)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    initCakeScroll()
    const layer = document.querySelector('.cake-layer')
    expect(layer.style.getPropertyValue('--cake-top')).toBe('0px')
    expect(layer.style.getPropertyValue('--cake-left')).toBe('0px')
    expect(layer.style.getPropertyValue('--cake-size')).toBe('0px')
  })
  it('com reduced motion: bolo estático, sem fixed', async () => {
    mockMatchMedia(true)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    initCakeScroll()
    const layer = document.querySelector('.cake-layer')
    expect(layer.classList.contains('is-fixed')).toBe(false)
    expect(layer.style.getPropertyValue('--cake-top')).toBe('')
  })
})
