import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Bolo do hero: gira, encolhe e some até o fim do #cardapio (scrub = acompanha o scroll nos dois sentidos).
export function initCakeScroll({ layer = document.querySelector('.cake-layer'), endTrigger = '#cardapio' } = {}) {
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
    { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1100px)', tablet: '(min-width: 768px) and (max-width: 1099px)' },
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
        xPercent: conditions.desktop ? 25 : 10,
        yPercent: conditions.desktop ? -10 : -70,
        duration: 1,
      }, 0)
      // Tablet: o bolo fica grande ao lado do título do cardápio; some antes para não atrapalhar a leitura.
      if (conditions.tablet) tl.to(cake, { opacity: 0, duration: 0.2 }, 0.1)
      else tl.to(cake, { opacity: 0, duration: 0.35 }, 0.65)
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
