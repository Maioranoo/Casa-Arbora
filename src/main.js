import { initMenu } from './js/menu.js'
import { initWhatsAppLinks } from './js/whatsapp.js'
import { initCardapio } from './js/cardapio.js'
import { initCakeScroll } from './js/cake-scroll.js'
import { initReveals } from './js/reveals.js'
import { initDevPendentes } from './js/dev-pendentes.js'
import { initPreloader } from './js/preloader.js'

// Primeiro: garante a saída da tela de carregamento mesmo se um init abaixo quebrar.
// A saída é assíncrona (espera fontes/bolo), então os inits síncronos abaixo — incluindo o cardápio — rodam antes dela.
initPreloader()
for (const init of [initMenu, initCardapio, initCakeScroll, initReveals, initWhatsAppLinks, initDevPendentes]) {
  try { init() } catch (erro) { console.error(`[casa-arbora] ${init.name} falhou:`, erro) }
}
document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear() })
