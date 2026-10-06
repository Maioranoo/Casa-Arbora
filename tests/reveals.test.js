import { describe, it, expect, vi, beforeEach } from 'vitest'

beforeEach(() => { vi.resetModules(); document.body.innerHTML = '<h2 data-reveal>t</h2>' })

it('com reduced motion não esconde nada', async () => {
  window.matchMedia = vi.fn().mockImplementation((q) => ({ matches: q.includes(': reduce'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))
  const { initReveals } = await import('../src/js/reveals.js')
  initReveals()
  expect(document.querySelector('h2').style.opacity).toBe('')
})
