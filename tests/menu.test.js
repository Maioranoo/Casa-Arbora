import { describe, it, expect, beforeEach } from 'vitest'
import { initMenu } from '../src/js/menu.js'
import { initDevPendentes } from '../src/js/dev-pendentes.js'

beforeEach(() => {
  document.documentElement.className = ''
  document.body.innerHTML = `
    <header><button data-menu-toggle aria-expanded="false" aria-controls="menu-principal">Menu</button>
    <nav id="menu-principal"><a href="#cardapio">Cardápio</a></nav></header>
    <main id="fora">x</main>
    <p data-pendente="foto da Tânia">p</p>`
  initMenu()
})
const btn = () => document.querySelector('[data-menu-toggle]')
const aberto = () => btn().getAttribute('aria-expanded') === 'true'

describe('initMenu', () => {
  it('abre e fecha no botão e trava o scroll', () => {
    btn().click(); expect(aberto()).toBe(true)
    expect(document.documentElement.classList.contains('menu-aberto')).toBe(true)
    btn().click(); expect(aberto()).toBe(false)
    expect(document.documentElement.classList.contains('menu-aberto')).toBe(false)
  })
  it('fecha com Esc e devolve o foco ao botão', () => {
    btn().click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(aberto()).toBe(false); expect(document.activeElement).toBe(btn())
  })
  it('fecha ao clicar num link e ao clicar fora', () => {
    btn().click(); document.querySelector('nav a').click(); expect(aberto()).toBe(false)
    btn().click(); document.getElementById('fora').click(); expect(aberto()).toBe(false)
  })
  it('fecha quando a tela vira desktop', () => {
    btn().click()
    window.innerWidth = 1200; window.dispatchEvent(new Event('resize'))
    expect(aberto()).toBe(false)
    expect(document.documentElement.classList.contains('menu-aberto')).toBe(false)
  })
})

describe('initDevPendentes', () => {
  it('só marca em dev', () => {
    initDevPendentes(document, false); expect(document.querySelector('.dev-pendente')).toBeNull()
    initDevPendentes(document, true)
    expect(document.querySelector('.dev-pendente').textContent).toBe('PENDENTE: foto da Tânia')
  })
})
