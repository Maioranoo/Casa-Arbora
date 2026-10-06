import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.hoisted(() => { // jsdom não tem matchMedia (o ScrollTrigger usa ao registrar)
  window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
})

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initPreloader } from '../src/js/preloader.js'

function adiado() {
  let resolve
  const promise = new Promise((r) => { resolve = r })
  return { promise, resolve }
}
const nunca = () => new Promise(() => {})
const tique = () => new Promise((r) => setTimeout(r, 0))

let fontes
beforeEach(() => {
  fontes = adiado()
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: fontes.promise } })
  document.documentElement.className = 'carregando'
  document.body.innerHTML = `
    <div class="preloader" role="status" aria-live="polite" aria-label="Carregando"></div>
    <img class="cake" src="/images/bolo-topo.png" alt="">
    <div data-cardapio><div role="tabpanel"></div></div>`
  document.querySelector('img.cake').decode = vi.fn(() => Promise.resolve())
  vi.spyOn(ScrollTrigger, 'refresh').mockImplementation(() => {})
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  delete document.fonts
})

describe('initPreloader', () => {
  it('espera as fontes e o bolo antes de sair', async () => {
    const decode = adiado()
    document.querySelector('img.cake').decode = vi.fn(() => decode.promise)
    initPreloader()
    await tique()
    const el = document.querySelector('.preloader')
    expect(el.classList.contains('preloader--saindo')).toBe(false)
    expect(document.documentElement.classList.contains('carregando')).toBe(true)
    fontes.resolve()
    await tique()
    expect(el.classList.contains('preloader--saindo')).toBe(false) // o bolo ainda não decodificou
    decode.resolve()
    await tique()
    expect(el.classList.contains('preloader--saindo')).toBe(true)
    expect(document.documentElement.classList.contains('carregando')).toBe(false)
  })

  it('remove o elemento no transitionend, chama ScrollTrigger.refresh e resolve', async () => {
    fontes.resolve()
    const pronto = initPreloader()
    await tique()
    const el = document.querySelector('.preloader')
    expect(el).not.toBeNull()
    el.dispatchEvent(new Event('transitionend'))
    await pronto
    expect(document.querySelector('.preloader')).toBeNull()
    expect(ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  it('erro ao decodificar o bolo não trava o preloader', async () => {
    fontes.resolve()
    document.querySelector('img.cake').decode = vi.fn(() => Promise.reject(new Error('falhou')))
    vi.useFakeTimers()
    const pronto = initPreloader()
    await vi.advanceTimersByTimeAsync(400)
    await pronto
    expect(document.querySelector('.preloader')).toBeNull()
  })

  it('sai no maxWait se alguma promessa nunca resolver (fallback de 400ms sem transitionend)', async () => {
    document.querySelector('img.cake').decode = vi.fn(nunca)
    vi.useFakeTimers()
    let resolvido = false
    initPreloader({ maxWait: 3000 }).then(() => { resolvido = true })
    await vi.advanceTimersByTimeAsync(2999)
    const el = document.querySelector('.preloader')
    expect(el.classList.contains('preloader--saindo')).toBe(false)
    expect(document.documentElement.classList.contains('carregando')).toBe(true)
    await vi.advanceTimersByTimeAsync(1)
    expect(el.classList.contains('preloader--saindo')).toBe(true)
    expect(document.documentElement.classList.contains('carregando')).toBe(false)
    expect(document.querySelector('.preloader')).not.toBeNull()
    await vi.advanceTimersByTimeAsync(400)
    expect(document.querySelector('.preloader')).toBeNull()
    expect(resolvido).toBe(true)
    expect(ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  it('respeita minDelay mesmo com tudo pronto', async () => {
    fontes.resolve()
    vi.useFakeTimers()
    initPreloader({ minDelay: 500 })
    await vi.advanceTimersByTimeAsync(499)
    expect(document.querySelector('.preloader').classList.contains('preloader--saindo')).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(document.querySelector('.preloader').classList.contains('preloader--saindo')).toBe(true)
  })

  it('sem o elemento: só tira a classe carregando e resolve', async () => {
    document.querySelector('.preloader').remove()
    await initPreloader()
    expect(document.documentElement.classList.contains('carregando')).toBe(false)
  })
})
