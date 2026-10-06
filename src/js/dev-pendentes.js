// Marca no site, só em `npm run dev`, o conteúdo que ainda falta (ver README → Pendências).
export function initDevPendentes(root = document, dev = import.meta.env.DEV) {
  if (!dev) return
  root.querySelectorAll('[data-pendente]').forEach((el) => {
    if (el.querySelector(':scope > .dev-pendente')) return
    const tag = document.createElement('span')
    tag.className = 'dev-pendente'
    tag.textContent = `PENDENTE: ${el.dataset.pendente}`
    el.prepend(tag)
  })
}
