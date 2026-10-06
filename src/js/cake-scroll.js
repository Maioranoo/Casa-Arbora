import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Bolo do hero: gira, encolhe e some até o fim do #cardapio (scrub = acompanha o scroll nos dois sentidos).
export function initCakeScroll({ layer = document.querySelector('.cake-layer'), endTrigger = '#cardapio', fadeTrigger = '#como-escolher' } = {}) {
  const cake = layer?.querySelector('.cake')
  if (!cake || !document.querySelector(endTrigger)) return

  // Ancora o layer fixo na posição do layer estático (scroll 0), em qualquer viewport.
  const measure = () => {
    layer.classList.remove('is-fixed')
    const r = layer.getBoundingClientRect()
    layer.style.setProperty('--cake-top', `${r.top + window.scrollY}px`)
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
      tl.to(cake, {
        rotation: 540,
        scale: 0,
        xPercent: conditions.desktop ? 40 : 10,
        yPercent: conditions.desktop ? -10 : -70,
        duration: 1,
      }, 0)
      if (conditions.desktop) {
        tl.to(cake, { opacity: 0, duration: 0.35 }, 0.65)
      } else {
        // Mobile/tablet: o bolo é grande e fica sob o texto do cardápio, então some antes (a faixa opaca "Como escolher" o cobre
        // no meio do caminho); escala/rotação continuam até o fim do #cardapio. No desktop o bolo fica à direita e não cobre texto.
        gsap.to(cake, {
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
      return () => {
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
        layer.classList.remove('is-fixed')
        layer.style.removeProperty('--cake-top')
        layer.style.removeProperty('--cake-left')
        layer.style.removeProperty('--cake-size')
        gsap.set(cake, { clearProps: 'all' })
      }
    },
  )

  const refresh = () => ScrollTrigger.refresh()
  window.addEventListener('load', refresh, { once: true })
  document.addEventListener('cardapio:change', refresh)
  return { mm }
}
