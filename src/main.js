import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/sections.css'
import { initMenu } from './js/menu.js'
import { initWhatsAppLinks } from './js/whatsapp.js'
import { initCardapio } from './js/cardapio.js'
import { initDevPendentes } from './js/dev-pendentes.js'

initMenu()
initCardapio()
initWhatsAppLinks()
initDevPendentes()
document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear() })
