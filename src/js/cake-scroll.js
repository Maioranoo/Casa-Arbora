import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FOLGA = 12 // px entre o fim do texto do hero e o bolo

// Topo (em coordenadas do documento) do layer fixo: a posição estática, mas puxada para cima se ela deixaria
// o bolo quase todo abaixo da dobra, sem nunca subir sobre o texto do hero (evitarAte = fim do texto + folga).
export function topoDoBolo({ topoEstatico, tamanho, alturaJanela, evitarAte = -Infinity }) {
  return Math.min(topoEstatico, Math.max(alturaJanela - tamanho * 0.75, evitarAte))
}

// Bolo do hero: gira, encolhe e some até o fim do #cardapio (scrub = acompanha o scroll nos dois sentidos).
export function initCakeScroll({
  layer = document.querySelector('.cake-layer'),
  endTrigger = '#cardapio',
  fadeTrigger = '#como-escolher',
  evitar = '.hero__conteudo',
} = {}) {
  const cake = layer?.querySelector('.cake')
  if (!cake || !document.querySelector(endTrigger)) return
  // Sombra num elemento irmão que NÃO gira (drop-shadow no próprio bolo giraria junto com ele)
  const alvos = [cake, layer.querySelector('.cake-sombra')].filter(Boolean)

  // Ancora o layer fixo na posição do layer estático (com scroll 0), em qualquer viewport.
  const measure = () => {
    layer.classList.remove('is-fixed')
    const r = layer.getBoundingClientRect()
    const texto = document.querySelector(evitar)?.getBoundingClientRect()
    const top = topoDoBolo({
      topoEstatico: r.top + window.scrollY,
      tamanho: r.width,
      alturaJanela: window.innerHeight,
      // no paisagem/desktop o bolo fica ao lado do texto (topo estático acima do fim do texto): o clamp não o move
      evitarAte: texto ? texto.bottom + window.scrollY + FOLGA : -Infinity,
    })
    layer.style.setProperty('--cake-top', `${top}px`)
    layer.style.setProperty('--cake-left', `${r.left}px`)
    layer.style.setProperty('--cake-size', `${r.width}px`)
    layer.classList.add('is-fixed')
  }

  const mm = gsap.matchMedia()
  mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1100px)' },
    ({ conditions }) => {
      if (!conditions.motion) return
      measure()
      const onRefreshInit = () => measure()
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit)
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          endTrigger,
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      tl.to(cake, { rotation: 540, duration: 1 }, 0)
      tl.to(alvos, {
        scale: 0,
        xPercent: conditions.desktop ? 40 : 10,
        yPercent: conditions.desktop ? -10 : -70,
        duration: 1,
      }, 0)
      if (conditions.desktop) {
        tl.to(alvos, { opacity: 0, duration: 0.35 }, 0.65)
      } else if (document.querySelector(fadeTrigger)) {
        // Mobile/tablet: o bolo é grande e fica sob o texto do cardápio, então some antes (a faixa opaca "Como escolher" o cobre
        // no meio do caminho); escala/rotação continuam até o fim do #cardapio. No desktop o bolo fica à direita e não cobre texto.
        gsap.to(alvos, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: fadeTrigger,
            start: 'top 70%',
            endTrigger,
            end: 'top bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
      }
      if (import.meta.env.DEV) window.__cakeST = tl.scrollTrigger

      // Imagens que carregam depois e a troca de aba do cardápio mudam a altura da página: recalcula os triggers.
      const refresh = () => ScrollTrigger.refresh()
      const aoCarregar = document.readyState !== 'complete'
      if (aoCarregar) window.addEventListener('load', refresh, { once: true })
      document.addEventListener('cardapio:change', refresh)

      return () => {
        if (aoCarregar) window.removeEventListener('load', refresh)
        document.removeEventListener('cardapio:change', refresh)
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
        layer.classList.remove('is-fixed')
        layer.style.removeProperty('--cake-top')
        layer.style.removeProperty('--cake-left')
        layer.style.removeProperty('--cake-size')
        gsap.set(alvos, { clearProps: 'all' })
      }
    },
  )

  return { mm }
}
