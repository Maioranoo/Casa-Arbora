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
  it('contagem por categoria e linhas ajustadas (v4)', () => {
    const n = Object.fromEntries(categorias.map((c) => [c.id, c.itens.length]))
    expect(n).toEqual({ classicos: 6, festa: 5, veganos: 5, docinhos: 3, muffins: 3, granola: 1, kits: 3 })
    // Os bolos veganos contêm glúten: selo Vegano, nunca Sem glúten
    const veganos = categorias.find((c) => c.id === 'veganos')
    expect(veganos.itens.every((i) => i.tags.includes('vg') && !i.tags.includes('sg'))).toBe(true)
    expect(veganos.nota.toLowerCase()).not.toContain('glúten')
    const ids = categorias.flatMap((c) => c.itens.map((i) => i.id))
    for (const x of ['vegano-laranja', 'classico-maca-baunilha-nozes', 'classico-mandala-morango']) expect(ids).not.toContain(x)
  })
  it('nunca usa "baixo índice glicêmico"', () => {
    expect(JSON.stringify(categorias).toLowerCase()).not.toContain('índice glicêmico')
  })
})

describe('mensagemItem', () => {
  it('monta a mensagem com item, categoria e tamanho', () => {
    const c = categorias[0]; const i = c.itens[3]
    expect(mensagemItem(c, i, i.opcoes[1])).toBe('Olá, Casa Árbora! Gostaria de fazer uma encomenda: Cacau & Tâmaras (Clássicos), tamanho Médio.')
  })
  it('kit usa a mensagem de consulta', () => {
    const c = categorias.at(-1); const i = c.itens[1]
    expect(mensagemItem(c, i, i.opcoes[0])).toBe('Olá, Casa Árbora! Gostaria de saber mais sobre o Kit Escolinha.')
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
    expect(panels[0].querySelectorAll('.produto')).toHaveLength(6)
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
    expect(decode(link.href)).toBe('Olá, Casa Árbora! Gostaria de fazer uma encomenda: Cacau & Tâmaras (Clássicos), tamanho Pequeno.')
    const medio = card.querySelector('input[value="1"]')
    medio.checked = true; medio.dispatchEvent(new Event('change', { bubbles: true }))
    expect(card.querySelector('.produto__preco').textContent).toBe('R$ 230')
    expect(decode(link.href)).toBe('Olá, Casa Árbora! Gostaria de fazer uma encomenda: Cacau & Tâmaras (Clássicos), tamanho Médio.')
    expect(link.href.startsWith('https://wa.me/5511942237434?text=')).toBe(true)
  })

  it('item de opção única não mostra seletor', () => {
    const card = root.querySelector('[data-item="docinho-beijinho"]')
    expect(card.querySelector('input[type="radio"]')).toBeNull()
    expect(card.querySelector('.produto__preco').textContent).toBe('R$ 105')
  })

  it('kit mostra Sob consulta e botão Consultar, sem NaN', () => {
    const card = root.querySelector('[data-item="kit-escolinha"]')
    expect(card.querySelector('.produto__preco').textContent).toBe('Sob consulta')
    expect(card.querySelector('[data-pedido]').textContent.trim()).toBe('Consultar')
    expect(root.innerHTML).not.toContain('NaN')
  })

  it('bolo sem preço ainda (Maçã & Baunilha) aparece como Sob consulta, com Consultar e mensagem de consulta', () => {
    const card = root.querySelector('[data-item="festa-maca-baunilha"]')
    expect(card.querySelector('.produto__preco').textContent).toBe('Sob consulta')
    expect(card.querySelector('input[type="radio"]')).toBeNull()
    const link = card.querySelector('[data-pedido]')
    expect(link.textContent.trim()).toBe('Consultar')
    expect(decode(link.href)).toBe('Olá, Casa Árbora! Gostaria de saber mais sobre o bolo Maçã & Baunilha (Festa).')
  })

  it('etiquetas de pendência só aparecem com dev: true', () => {
    expect(root.querySelector('.dev-pendente')).toBeNull()
    renderCardapio(root, categorias, { dev: true })
    expect(root.querySelector('[data-item="kit-escolinha"] .dev-pendente').textContent).toBe('PENDENTE: foto')
  })

  it('imagens têm width/height e lazy', () => {
    const img = root.querySelector('.produto img')
    expect(img.getAttribute('width')).toBe('800')
    expect(img.getAttribute('height')).toBe('800')
    expect(img.getAttribute('loading')).toBe('lazy')
  })

  it('selos das tags são lazy/async', () => {
    const selo = root.querySelector('.tag img')
    expect(selo.getAttribute('loading')).toBe('lazy')
    expect(selo.getAttribute('decoding')).toBe('async')
  })

  it('tag desconhecida é ignorada sem quebrar o cardápio', () => {
    const dados = [{ id: 'x', nome: 'X', subtitulo: '', nota: '', itens: [
      { id: 'x-1', nome: 'Bolo X', tags: ['bf', 'nao-existe'], descricao: 'd', foto: '/images/cardapio/x.jpg', alt: 'alt x', opcoes: [{ rotulo: 'Único', detalhe: '', preco: 10 }] },
    ] }]
    expect(() => renderCardapio(root, dados)).not.toThrow()
    const tags = root.querySelectorAll('[data-item="x-1"] .tag')
    expect(tags).toHaveLength(1)
    expect(tags[0].textContent).toBe('Baby Friendly')
  })

  it('escapa id e foto nos atributos', () => {
    const dados = [{ id: 'x', nome: 'X', subtitulo: '', nota: '', itens: [
      { id: 'a"b', nome: 'X', tags: [], descricao: 'd', foto: '/f.jpg" onerror="alert(1)', alt: 'alt x', opcoes: [{ rotulo: 'Único', detalhe: '', preco: 10 }] },
    ] }]
    renderCardapio(root, dados)
    const card = root.querySelector('.produto')
    expect(card.dataset.item).toBe('a"b')
    const img = card.querySelector('.produto__foto img')
    expect(img.getAttribute('src')).toBe('/f.jpg" onerror="alert(1)')
    expect(img.hasAttribute('onerror')).toBe(false)
  })

  it('renderizar de novo não acumula ouvintes de change no root', () => {
    const add = vi.spyOn(root, 'addEventListener')
    renderCardapio(root, categorias)
    renderCardapio(root, categorias)
    const sinais = add.mock.calls.filter(([tipo]) => tipo === 'change').map(([, , opts]) => opts.signal)
    expect(sinais).toHaveLength(2)
    expect(sinais.filter((s) => !s.aborted)).toHaveLength(1)
    // e o ouvinte ativo continua funcionando (atualiza o preço uma vez)
    const card = root.querySelector('[data-item="classico-cacau-tamaras"]')
    const medio = card.querySelector('input[value="1"]')
    medio.checked = true; medio.dispatchEvent(new Event('change', { bubbles: true }))
    expect(card.querySelector('.produto__preco').textContent).toBe('R$ 230')
  })
})
