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
  it('sombra: acompanha escala/opacidade do bolo, mas nao gira', async () => {
    document.querySelector('.cake-layer').insertAdjacentHTML('afterbegin', '<div class="cake-sombra"></div>')
    mockMatchMedia(false, true)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    initCakeScroll()
    const sombra = document.querySelector('.cake-sombra')
    const filhos = ScrollTrigger.getAll().find((st) => st.vars.end === 'bottom bottom').animation.getChildren()
    const comSombra = filhos.filter((t) => t.targets().includes(sombra))
    expect(comSombra.some((t) => t.vars.scale === 0)).toBe(true)
    expect(comSombra.some((t) => t.vars.opacity === 0)).toBe(true)
    expect(comSombra.some((t) => 'rotation' in t.vars)).toBe(false)
  })
  it('sem o trigger de fade (#como-escolher): nao quebra e pula o fade antecipado', async () => {
    document.querySelector('#como-escolher').remove()
    mockMatchMedia(false, false)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    expect(() => initCakeScroll()).not.toThrow()
    expect(ScrollTrigger.getAll().some((st) => st.vars.trigger === '#como-escolher')).toBe(false)
    expect(ScrollTrigger.getAll().some((st) => st.vars.end === 'bottom bottom')).toBe(true)
  })
  it('ouvinte de cardapio:change vive dentro do matchMedia (removido no revert)', async () => {
    mockMatchMedia(false)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    const refresh = vi.spyOn(ScrollTrigger, 'refresh').mockImplementation(() => {})
    const { mm } = initCakeScroll()
    document.dispatchEvent(new CustomEvent('cardapio:change'))
    expect(refresh).toHaveBeenCalledTimes(1)
    mm.revert()
    document.dispatchEvent(new CustomEvent('cardapio:change'))
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(document.querySelector('.cake-layer').classList.contains('is-fixed')).toBe(false)
    refresh.mockRestore()
  })
  it('com reduced motion: nenhum ouvinte de refresh e registrado', async () => {
    mockMatchMedia(true)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    const refresh = vi.spyOn(ScrollTrigger, 'refresh').mockImplementation(() => {})
    initCakeScroll()
    document.dispatchEvent(new CustomEvent('cardapio:change'))
    expect(refresh).not.toHaveBeenCalled()
    refresh.mockRestore()
  })
  it('measure: puxa o bolo para a dobra quando a posicao estatica fica baixa demais', async () => {
    mockMatchMedia(false)
    document.querySelector('#inicio').insertAdjacentHTML('beforeend', '<div class="hero__conteudo"></div>')
    const layer = document.querySelector('.cake-layer')
    layer.getBoundingClientRect = () => ({ top: 900, left: 100, width: 300, bottom: 1200, right: 400, height: 300 })
    document.querySelector('.hero__conteudo').getBoundingClientRect = () => ({ top: 80, bottom: 400, left: 16, right: 344, width: 328, height: 320 })
    const alturaOriginal = window.innerHeight
    window.innerHeight = 667
    try {
      const { initCakeScroll } = await import('../src/js/cake-scroll.js')
      initCakeScroll()
      // 667 - 0.75 * 300 = 442 (abaixo de 400 + 12 de folga do texto): sobe de 900 para 442
      expect(layer.style.getPropertyValue('--cake-top')).toBe('442px')
      expect(layer.style.getPropertyValue('--cake-left')).toBe('100px')
      expect(layer.style.getPropertyValue('--cake-size')).toBe('300px')
    } finally { window.innerHeight = alturaOriginal }
  })
})

describe('topoDoBolo', () => {
  it('mantem a posicao estatica quando ela ja aparece na dobra', async () => {
    const { topoDoBolo } = await import('../src/js/cake-scroll.js')
    expect(topoDoBolo({ topoEstatico: 500, tamanho: 300, alturaJanela: 844, evitarAte: 480 })).toBe(500)
  })
  it('sobe ate innerHeight - 75% do bolo', async () => {
    const { topoDoBolo } = await import('../src/js/cake-scroll.js')
    expect(topoDoBolo({ topoEstatico: 900, tamanho: 300, alturaJanela: 667, evitarAte: 300 })).toBe(442)
  })
  it('nunca sobe acima do fim do texto (prefere nao cobrir texto)', async () => {
    const { topoDoBolo } = await import('../src/js/cake-scroll.js')
    expect(topoDoBolo({ topoEstatico: 900, tamanho: 300, alturaJanela: 640, evitarAte: 560 })).toBe(560)
  })
  it('paisagem/desktop (bolo ao lado do texto): nao move', async () => {
    const { topoDoBolo } = await import('../src/js/cake-scroll.js')
    expect(topoDoBolo({ topoEstatico: 80, tamanho: 242, alturaJanela: 390, evitarAte: 531 })).toBe(80)
  })
})
