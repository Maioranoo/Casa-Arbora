import config from '../config.js'
import { buildWhatsAppUrl } from './whatsapp.js'
import { categorias as dadosPadrao, TAGS } from '../data/cardapio.js'

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function formatPreco(preco) {
  if (preco == null) return 'Sob consulta'
  return fmt.format(preco).replace(/\s/g, ' ')
}

export function mensagemItem(categoria, item, opcao) {
  if (item.tipo === 'kit') return config.mensagens.kit(item.nome)
  return config.mensagens.item({
    categoria: categoria.nome, item: item.nome,
    rotulo: opcao.rotulo, detalhe: opcao.detalhe, preco: formatPreco(opcao.preco),
  })
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function tagsHTML(tags) {
  // Tag desconhecida (erro de digitação em src/data/cardapio.js) é ignorada em vez de quebrar o cardápio inteiro
  return `<ul class="tags" aria-label="Características">${tags.filter((t) => Object.hasOwn(TAGS, t)).map((t) => {
    const tag = TAGS[t]
    const selo = tag.selo ? `<img src="${esc(tag.selo)}" alt="" width="20" height="20" loading="lazy" decoding="async">` : ''
    return `<li class="tag tag--${esc(t)}">${selo}${esc(tag.rotulo)}</li>`
  }).join('')}</ul>`
}

function opcoesHTML(item) {
  if (item.opcoes.length === 1) {
    const o = item.opcoes[0]
    if (o.preco == null) return ''
    return `<p class="opcao-unica"><strong>${esc(o.rotulo)}</strong>${o.detalhe ? ` · ${esc(o.detalhe)}` : ''}</p>`
  }
  return `<fieldset class="tamanhos"><legend class="sr-only">Escolha o tamanho de ${esc(item.nome)}</legend>${item.opcoes.map((o, idx) => `
    <label class="tamanho">
      <input type="radio" name="tam-${esc(item.id)}" value="${idx}" ${idx === 0 ? 'checked' : ''}>
      <span class="tamanho__rotulo">${esc(o.rotulo)}</span>
      <span class="tamanho__detalhe">${esc(o.detalhe)}</span>
      <span class="tamanho__preco">${formatPreco(o.preco)}</span>
    </label>`).join('')}</fieldset>`
}

function cardHTML(categoria, item, dev) {
  const o = item.opcoes[0]
  const pend = dev && item.pendente?.length
    ? `<span class="dev-pendente">PENDENTE: ${item.pendente.join(', ')}</span>` : ''
  return `
  <article class="produto" data-item="${esc(item.id)}">
    <div class="produto__foto">${pend}<img src="${esc(item.foto)}" alt="${esc(item.alt)}" width="800" height="800" loading="lazy" decoding="async"></div>
    <div class="produto__corpo">
      ${tagsHTML(item.tags)}
      <h3 class="produto__nome">${esc(item.nome)}</h3>
      <p class="produto__desc">${esc(item.descricao)}</p>
      ${opcoesHTML(item)}
      <div class="produto__rodape">
        <p class="produto__preco" aria-live="polite">${formatPreco(o.preco)}</p>
        <a class="btn btn--primario" data-pedido href="${buildWhatsAppUrl(mensagemItem(categoria, item, o))}" target="_blank" rel="noopener"
           aria-label="${item.tipo === 'kit' ? 'Consultar' : 'Encomendar'} ${esc(item.nome)} pelo WhatsApp">${item.tipo === 'kit' ? 'Consultar' : 'Encomendar'}</a>
      </div>
    </div>
  </article>`
}

export function renderCardapio(root, categorias = dadosPadrao, { dev = false } = {}) {
  root.innerHTML = `
    <div class="abas" role="tablist" aria-label="Categorias do cardápio">
      ${categorias.map((c, i) => `<button type="button" class="aba" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(c.nome)}</button>`).join('')}
    </div>
    ${categorias.map((c, i) => `
      <section class="painel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" ${i === 0 ? '' : 'hidden'}>
        <header class="painel__cabeca">
          <p class="painel__sub">${esc(c.subtitulo)}</p>
          <p class="painel__nota">${esc(c.nota)}</p>
        </header>
        <div class="grade-produtos">${c.itens.map((it) => cardHTML(c, it, dev)).join('')}</div>
      </section>`).join('')}`

  const tabs = [...root.querySelectorAll('[role="tab"]')]

  function selecionar(tab, focar = false) {
    tabs.forEach((t) => {
      const ativo = t === tab
      t.setAttribute('aria-selected', String(ativo))
      t.tabIndex = ativo ? 0 : -1
      root.querySelector(`#${t.getAttribute('aria-controls')}`).hidden = !ativo
    })
    if (focar) tab.focus()
    document.dispatchEvent(new CustomEvent('cardapio:change', { detail: { id: tab.id.replace('tab-', '') } }))
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { if (tab.getAttribute('aria-selected') !== 'true') selecionar(tab) })
    tab.addEventListener('keydown', (e) => {
      const alvo = { ArrowRight: tabs[(i + 1) % tabs.length], ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length], Home: tabs[0], End: tabs.at(-1) }[e.key]
      if (alvo) { e.preventDefault(); selecionar(alvo, true) }
    })
  })

  // Um único ouvinte de "change" por root, mesmo se o cardápio for renderizado de novo
  root._cardapioAbort?.abort()
  root._cardapioAbort = new AbortController()
  root.addEventListener('change', (e) => {
    if (e.target.type !== 'radio') return
    const card = e.target.closest('.produto')
    const cat = categorias.find((c) => c.itens.some((it) => it.id === card.dataset.item))
    const item = cat.itens.find((it) => it.id === card.dataset.item)
    const opcao = item.opcoes[Number(e.target.value)]
    card.querySelector('.produto__preco').textContent = formatPreco(opcao.preco)
    card.querySelector('[data-pedido]').href = buildWhatsAppUrl(mensagemItem(cat, item, opcao))
  }, { signal: root._cardapioAbort.signal })
}

export function initCardapio(root = document.querySelector('[data-cardapio]')) {
  if (!root) return
  renderCardapio(root, dadosPadrao, { dev: import.meta.env.DEV })
}
