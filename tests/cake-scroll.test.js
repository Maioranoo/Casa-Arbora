import { describe, it, expect, beforeEach, vi } from 'vitest'

function mockMatchMedia(reduce, desktop = false) {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: q.includes('no-preference') ? !reduce : q.includes(': reduce') ? reduce : q.includes('1100px') ? desktop : false,
    media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }))
}

beforeEach(() => {
  vi.resetModules()
  document.body.innerHTML = '<section id="inicio"><div class="cake-layer"><img class="cake"></div></section><section id="como-escolher"></section><section id="cardapio"></section>'
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
  it('fora do desktop: o bolo some cedo (trigger proprio de opacidade de #como-escolher ate o topo do #cardapio)', async () => {
    mockMatchMedia(false, false)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    initCakeScroll()
    const fade = ScrollTrigger.getAll().find((st) => st.vars.trigger === '#como-escolher')
    expect(fade).toBeTruthy()
    expect(fade.vars.endTrigger).toBe('#cardapio')
    expect(fade.vars.end).toBe('top bottom')
    expect(fade.animation.vars.opacity).toBe(0)
    // a timeline principal (escala/rotacao ate o fim do #cardapio) segue existindo
    expect(ScrollTrigger.getAll().some((st) => st.vars.end === 'bottom bottom')).toBe(true)
  })
  it('desktop: sem fade antecipado, opacidade 0 so no fim da timeline', async () => {
    mockMatchMedia(false, true)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    initCakeScroll()
    expect(ScrollTrigger.getAll().some((st) => st.vars.trigger === '#como-escolher')).toBe(false)
    const main = ScrollTrigger.getAll().find((st) => st.vars.end === 'bottom bottom')
    const fade = main.animation.getChildren().find((t) => t.vars.opacity === 0)
    expect(fade.startTime()).toBeCloseTo(0.65)
  })
})
