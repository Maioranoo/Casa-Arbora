import config from '../config.js'

export function buildWhatsAppUrl(texto, numero = config.whatsappNumber) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

export function initWhatsAppLinks(root = document) {
  root.querySelectorAll('[data-whatsapp]').forEach((el) => {
    const texto = el.dataset.whatsappText || config.mensagens.generica
    el.href = buildWhatsAppUrl(texto)
    el.target = '_blank'
    el.rel = 'noopener'
  })
}
