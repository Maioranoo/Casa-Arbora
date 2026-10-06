import { describe, it, expect, beforeEach, vi } from 'vitest'
import { categorias } from '../src/data/cardapio.js'
import { formatPreco, mensagemItem, renderCardapio } from '../src/js/cardapio.js'
const decode = (href) => decodeURIComponent(href.split('text=')[1])

describe('formatPreco', () => {
  it('formata reais sem centavos com espaço normal', () => expect(formatPreco(160)).toBe('R$ 160'))
  it('null vira Sob consulta', () => expect(formatPreco(null)).toBe('Sob consulta'))
})

describe('dados', () => {
  it('tem as 7 categorias na ordem do spec', () => {
    expect(categorias.map((c) => c.id)).toEqual(['classicos', 'festa', 'veganos', 'docinhos', 'muffins', 'granola', 'kits'])
  })
  it('todo item tem foto, alt e ao menos uma opção', () => {
    for (const c of categorias) for (const i of c.itens) {
      expect(i.foto).toMatch(/^\/images\/cardapio\/.+\.jpg$/)
      expect(i.alt.length).toBeGreaterThan(3)
      expect(i.opcoes.length).toBeGreaterThan(0)
    }
  })
  it('nunca usa "baixo índice glicêmico"', () => {
    expect(JSON.stringify(categorias).toLowerCase()).not.toContain('índice glicêmico')
  })
})

describe('mensagemItem', () => {
  it('monta a mensagem com categoria, tamanho e preço', () => {
    const c = categorias[0]; const i = c.itens[3]
    expect(mensagemItem(c, i, i.opcoes[1])).toContain('Clássicos — Cacau & Tâmaras, Médio (12 a 14 fatias · 1,2 kg), R$ 230.')
  })
  it('kit usa a mensagem de consulta', () => {
    const c = categorias.at(-1); const i = c.itens[1]
    expect(mensagemItem(c, i, i.opcoes[0])).toContain('Quero saber os valores do Kit Escolinha.')
  })
})

describe('renderCardapio', () => {
  let root
  beforeEach(() => {
    document.body.innerHTML = '<div data-cardapio></div>'
    root = document.querySelector('[data-cardapio]')
    renderCardapio(root, categorias)
  })

  it('cria uma aba por categoria e só a primeira painel visível', () => {
    const tabs = root.querySelectorAll('[role="tab"]')
    expect(tabs).toHaveLength(7)
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    const panels = root.querySelectorAll('[role="tabpanel"]')
    expect([...panels].filter((p) => !p.hidden)).toHaveLength(1)
    expect(panels[0].querySelectorAll('.produto')).toHaveLength(8)
  })

  it('clicar numa aba troca o painel e dispara cardapio:change', () => {
    const spy = vi.fn(); document.addEventListener('cardapio:change', spy)
    root.querySelector('#tab-veganos').click()
    expect(root.querySelector('#panel-veganos').hidden).toBe(false)
    expect(root.querySelector('#panel-classicos').hidden).toBe(true)
    expect(root.querySelector('#tab-veganos').getAttribute('aria-selected')).toBe('true')
    expect(spy).toHaveBeenCalledOnce()
    expect(spy.mock.calls[0][0].detail).toEqual({ id: 'veganos' })
  })

  it('setas do teclado movem a aba e o foco', () => {
    const t0 = root.querySelector('#tab-classicos'); t0.focus()
    t0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement.id).toBe('tab-festa')
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(document.activeElement.id).toBe('tab-kits')
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement.id).toBe('tab-classicos')
  })

  it('trocar o tamanho atualiza preço e link do WhatsApp', () => {
    const card = root.querySelector('[data-item="classico-cacau-tamaras"]')
    const link = card.querySelector('[data-pedido]')
    expect(decode(link.href)).toContain('Pequeno (9 a 10 fatias · 900 g), R$ 160.')
    const medio = card.querySelector('input[value="1"]')
    medio.checked = true; medio.dispatchEvent(new Event('change', { bubbles: true }))
    expect(card.querySelector('.produto__preco').textContent).toBe('R$ 230')
    expect(decode(link.href)).toContain('Médio (12 a 14 fatias · 1,2 kg), R$ 230.')
    expect(link.href.startsWith('https://wa.me/5511942237434?text=')).toBe(true)
  })

  it('item de opção única não mostra seletor', () => {
    const card = root.querySelector('[data-item="docinho-beijinho"]')
    expect(card.querySelector('input[type="radio"]')).toBeNull()
    expect(card.querySelector('.produto__preco').textContent).toBe('R$ 90')
  })

  it('kit mostra Sob consulta e botão Consultar, sem NaN', () => {
    const card = root.querySelector('[data-item="kit-escolinha"]')
    expect(card.querySelector('.produto__preco').textContent).toBe('Sob consulta')
    expect(card.querySelector('[data-pedido]').textContent.trim()).toBe('Consultar')
    expect(root.innerHTML).not.toContain('NaN')
  })

  it('etiquetas de pendência só aparecem com dev: true', () => {
    expect(root.querySelector('.dev-pendente')).toBeNull()
    renderCardapio(root, categorias, { dev: true })
    expect(root.querySelector('[data-item="classico-maca-baunilha-nozes"] .dev-pendente').textContent).toBe('PENDENTE: foto')
  })

  it('imagens têm width/height e lazy', () => {
    const img = root.querySelector('.produto img')
    expect(img.getAttribute('width')).toBe('800')
    expect(img.getAttribute('height')).toBe('800')
    expect(img.getAttribute('loading')).toBe('lazy')
  })
})
