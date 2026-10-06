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
  it('mensagem genérica é curta e sem roteiro', () => {
    expect(config.mensagens.generica).toBe('Olá, Casa Árbora! Gostaria de fazer uma encomenda.')
  })
  it('mensagem de item traz item, categoria e tamanho (sem detalhe/preço)', () => {
    const msg = config.mensagens.item({ categoria: 'Clássicos', item: 'Cacau & Tâmaras', rotulo: 'Médio', detalhe: '12 a 14 fatias · 1,2 kg', preco: 'R$ 230' })
    expect(msg).toBe('Olá, Casa Árbora! Gostaria de fazer uma encomenda: Cacau & Tâmaras (Clássicos), tamanho Médio.')
  })
  it('mensagem de kit pede para saber mais', () => {
    expect(config.mensagens.kit('Kit Escolinha')).toBe('Olá, Casa Árbora! Gostaria de saber mais sobre o Kit Escolinha.')
  })
  it('nenhuma mensagem traz o roteiro Data/Convidados/Restrições', () => {
    const todas = [config.mensagens.generica, config.mensagens.item({ categoria: 'a', item: 'b', rotulo: 'c', detalhe: 'd', preco: 'e' }), config.mensagens.kit('k')].join(' ')
    expect(todas).not.toMatch(/Data:|Convidados:|Restrições:/)
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
