import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockMedia = (mode) => {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: mode === 'no-preference' ? q.includes('no-preference') : q.includes(': reduce') && !q.includes('no-preference'),
    media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }))
}

let gsapRef
beforeEach(() => { vi.resetModules(); document.body.innerHTML = '<h2 data-reveal>t</h2>' })
afterEach(() => { gsapRef?.globalTimeline.clear(); gsapRef = null })

describe('initReveals', () => {
  it('com reduced motion não esconde nada', async () => {
    mockMedia('reduce')
    const { initReveals } = await import('../src/js/reveals.js')
    initReveals()
    expect(document.querySelector('h2').style.opacity).toBe('')
  })

  it('sem restrição de movimento, pré-esconde [data-reveal] (reveal ligado)', async () => {
    mockMedia('no-preference')
    ;({ gsap: gsapRef } = await import('gsap'))
    const { initReveals } = await import('../src/js/reveals.js')
    initReveals()
    expect(document.querySelector('h2').style.opacity).toBe('0')
  })

  it('ao trocar de aba, os cards do painel terminam visíveis', async () => {
    mockMedia('no-preference')
    document.body.innerHTML = `
      <div role="tabpanel" id="panel-classicos"><div class="produto"></div></div>
      <div role="tabpanel" id="panel-festa" hidden><div class="produto"></div><div class="produto"></div></div>`
    ;({ gsap: gsapRef } = await import('gsap'))
    const { initReveals } = await import('../src/js/reveals.js')
    initReveals()
    document.dispatchEvent(new CustomEvent('cardapio:change', { detail: { id: 'festa' } }))
    const cards = [...document.querySelectorAll('#panel-festa .produto')]
    const tweens = gsapRef.getTweensOf(cards)
    expect(tweens.length).toBeGreaterThan(0)
    tweens.forEach((t) => t.progress(1))
    cards.forEach((c) => expect(c.style.opacity).toBe('1'))
  })
})
