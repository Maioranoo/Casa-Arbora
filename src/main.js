import { initMenu } from './js/menu.js'
import { initWhatsAppLinks } from './js/whatsapp.js'
import { initCardapio } from './js/cardapio.js'
import { initCakeScroll } from './js/cake-scroll.js'
import { initReveals } from './js/reveals.js'
import { initDevPendentes } from './js/dev-pendentes.js'
import { initPreloader } from './js/preloader.js'

initMenu()
initCardapio()
initCakeScroll()
initReveals()
initWhatsAppLinks()
initDevPendentes()
document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear() })
initPreloader() // depois do initCardapio: o cardápio já está renderizado
