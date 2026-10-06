import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
const SAIDA_MS = 400 // fallback se o transitionend não vier (a transição de opacidade é de 300ms)

// Tela de carregamento: sai quando fontes + bolo do hero estão prontos (o cardápio já foi renderizado,
// pois esta função roda depois do initCardapio), ou no maxWait — o que vier primeiro.
export function initPreloader({ minDelay = 0, maxWait = 3000 } = {}) {
  const html = document.documentElement
  const el = document.querySelector('.preloader')
  if (!el) {
    html.classList.remove('carregando')
    return Promise.resolve()
  }
  const cake = document.querySelector('img.cake')
  const pronto = Promise.all([
    Promise.resolve(document.fonts?.ready).catch(() => {}),
    cake?.decode ? cake.decode().catch(() => {}) : null,
  ])
  return Promise.all([Promise.race([pronto, esperar(maxWait)]), esperar(minDelay)]).then(() => sair(el, html))
}

function sair(el, html) {
  return new Promise((resolve) => {
    let feito = false
    const fim = () => {
      if (feito) return
      feito = true
      el.remove()
      ScrollTrigger.refresh() // o layout pode ter mudado (fontes, overflow do html liberado)
      resolve()
    }
    el.addEventListener('transitionend', (e) => { if (e.target === el) fim() })
    setTimeout(fim, SAIDA_MS)
    el.classList.add('preloader--saindo')
    html.classList.remove('carregando')
  })
}
