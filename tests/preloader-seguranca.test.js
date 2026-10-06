import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Os scripts inline do index.html (rede de segurança do preloader) são testados a partir do próprio HTML
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
const script = (nome) => {
  const m = html.match(new RegExp(`<script data-preloader="${nome}">([\\s\\S]*?)</script>`))
  if (!m) throw new Error(`script inline "${nome}" não encontrado no index.html`)
  return m[1]
}
const rodar = (nome) => new Function(script(nome))()

beforeEach(() => {
  vi.useFakeTimers()
  document.documentElement.className = 'carregando'
  document.body.innerHTML = `
    <div class="preloader"></div>
    <header class="topo"></header><main id="conteudo"></main><footer class="rodape"></footer>`
})
afterEach(() => {
  vi.useRealTimers()
  delete window.__casaPreloaderTimer
})

describe('scripts inline do preloader', () => {
  it('o script do fim do body deixa topo, conteúdo e rodapé inertes', () => {
    rodar('inert')
    for (const sel of ['.topo', '#conteudo', '.rodape']) expect(document.querySelector(sel).hasAttribute('inert')).toBe(true)
  })

  it('a rede de segurança libera a página em 6s se ninguém cancelar', () => {
    rodar('seguranca')
    rodar('inert')
    expect(typeof window.__casaPreloaderTimer).not.toBe('undefined')
    vi.advanceTimersByTime(5999)
    expect(document.querySelector('.preloader')).not.toBeNull()
    expect(document.documentElement.classList.contains('carregando')).toBe(true)
    vi.advanceTimersByTime(1)
    expect(document.querySelector('.preloader')).toBeNull()
    expect(document.documentElement.classList.contains('carregando')).toBe(false)
    for (const sel of ['.topo', '#conteudo', '.rodape']) expect(document.querySelector(sel).hasAttribute('inert')).toBe(false)
  })

  it('cancelada (clearTimeout), não faz nada', () => {
    rodar('seguranca')
    clearTimeout(window.__casaPreloaderTimer)
    vi.advanceTimersByTime(7000)
    expect(document.querySelector('.preloader')).not.toBeNull()
  })
})
