import { describe, it, expect, vi } from 'vitest'

const chamadas = []
const mock = (nome, falha = false) => vi.fn(() => { chamadas.push(nome); if (falha) throw new Error(`${nome} quebrou`) })
const m = vi.hoisted(() => ({}))
vi.mock('../src/js/menu.js', () => ({ initMenu: (m.initMenu = mock('initMenu', true)) }))
vi.mock('../src/js/cardapio.js', () => ({ initCardapio: (m.initCardapio = mock('initCardapio')) }))
vi.mock('../src/js/cake-scroll.js', () => ({ initCakeScroll: (m.initCakeScroll = mock('initCakeScroll', true)) }))
vi.mock('../src/js/reveals.js', () => ({ initReveals: (m.initReveals = mock('initReveals')) }))
vi.mock('../src/js/whatsapp.js', () => ({ initWhatsAppLinks: (m.initWhatsAppLinks = mock('initWhatsAppLinks')) }))
vi.mock('../src/js/dev-pendentes.js', () => ({ initDevPendentes: (m.initDevPendentes = mock('initDevPendentes')) }))
vi.mock('../src/js/preloader.js', () => ({ initPreloader: (m.initPreloader = vi.fn(() => { chamadas.push('initPreloader'); return Promise.resolve() })) }))

describe('main.js', () => {
  it('inicia o preloader primeiro e roda os outros inits mesmo se algum quebrar', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {})
    await import('../src/main.js')
    expect(chamadas[0]).toBe('initPreloader')
    expect(chamadas).toEqual(['initPreloader', 'initMenu', 'initCardapio', 'initCakeScroll', 'initReveals', 'initWhatsAppLinks', 'initDevPendentes'])
    expect(erro).toHaveBeenCalledTimes(2)
    // Preloader fica pelo menos 1s para não virar um "vulto" em internet rápida
    expect(m.initPreloader).toHaveBeenCalledWith({ minDelay: 1000 })
  })
})
