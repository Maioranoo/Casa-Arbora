import { describe, it, expect, beforeEach } from 'vitest'
import config from '../src/config.js'
import { buildWhatsAppUrl, initWhatsAppLinks } from '../src/js/whatsapp.js'

describe('buildWhatsAppUrl', () => {
  it('monta a URL wa.me com o número da config', () => {
    expect(buildWhatsAppUrl('Oi')).toBe('https://wa.me/5511942237434?text=Oi')
  })
  it('codifica &, acentos e quebras de linha', () => {
    const url = buildWhatsAppUrl('Cacau & Tâmaras\nData: ')
    expect(url).toBe('https://wa.me/5511942237434?text=Cacau%20%26%20T%C3%A2maras%0AData%3A%20')
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Cacau & Tâmaras\nData: ')
  })
})

describe('mensagens', () => {
  it('mensagem de item traz categoria, item, tamanho, detalhe e preço', () => {
    const msg = config.mensagens.item({ categoria: 'Clássicos', item: 'Cacau & Tâmaras', rotulo: 'Médio', detalhe: '12 a 14 fatias · 1,2 kg', preco: 'R$ 230' })
    expect(msg).toBe('Olá, Casa Árbora! Quero encomendar: Clássicos — Cacau & Tâmaras, Médio (12 a 14 fatias · 1,2 kg), R$ 230.\nData: \nConvidados: \nRestrições: ')
  })
  it('mensagem de kit pede valores', () => {
    expect(config.mensagens.kit('Kit Escolinha')).toBe('Olá, Casa Árbora! Quero saber os valores do Kit Escolinha.\nData: \nConvidados: \nRestrições: ')
  })
})

describe('initWhatsAppLinks', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a id="a" data-whatsapp href="https://wa.me/5511942237434">x</a>
      <a id="b" data-whatsapp data-whatsapp-text="Texto próprio">y</a>`
  })
  it('aplica href, target e rel', () => {
    initWhatsAppLinks()
    const a = document.getElementById('a')
    expect(a.href).toBe(buildWhatsAppUrl(config.mensagens.generica))
    expect(a.target).toBe('_blank')
    expect(a.rel).toBe('noopener')
    expect(document.getElementById('b').href).toBe(buildWhatsAppUrl('Texto próprio'))
  })
})
