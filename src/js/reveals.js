import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initReveals(root = document) {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 24, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    })

    const revelarCards = (painel) => {
      const cards = painel?.querySelectorAll('.produto')
      if (!cards?.length) return
      gsap.from(cards, {
        opacity: 0, y: 24, duration: 0.6, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: painel, start: 'top 85%', once: true },
      })
    }
    revelarCards(root.querySelector('[role="tabpanel"]:not([hidden])'))

    const aoTrocar = (e) => {
      const painel = root.querySelector(`#panel-${e.detail.id}`)
      if (!painel) return
      gsap.fromTo(painel.querySelectorAll('.produto'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: 'power2.out', overwrite: true })
    }
    document.addEventListener('cardapio:change', aoTrocar)

    root.querySelectorAll('[data-parallax]').forEach((el) => {
      gsap.to(el, {
        yPercent: Number(el.dataset.parallax) || -20, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })

    return () => document.removeEventListener('cardapio:change', aoTrocar)
  })
}
