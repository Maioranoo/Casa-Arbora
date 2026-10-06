const DESKTOP = 1100

export function initMenu(root = document) {
  const btn = root.querySelector('[data-menu-toggle]')
  const nav = root.querySelector('#menu-principal')
  if (!btn || !nav) return

  const setAberto = (aberto, devolverFoco = false) => {
    btn.setAttribute('aria-expanded', String(aberto))
    btn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu')
    nav.classList.toggle('is-aberto', aberto)
    document.documentElement.classList.toggle('menu-aberto', aberto)
    if (!aberto && devolverFoco) btn.focus()
  }
  const estaAberto = () => btn.getAttribute('aria-expanded') === 'true'

  btn.addEventListener('click', (e) => { e.stopPropagation(); setAberto(!estaAberto()) })
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setAberto(false) })
  document.addEventListener('click', (e) => {
    if (estaAberto() && !nav.contains(e.target) && !btn.contains(e.target)) setAberto(false)
  })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && estaAberto()) setAberto(false, true) })
  window.addEventListener('resize', () => { if (window.innerWidth >= DESKTOP && estaAberto()) setAberto(false) })
}
