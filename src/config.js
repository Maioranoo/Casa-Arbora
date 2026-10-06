// Dados da marca — troque aqui nome, WhatsApp, Instagram e textos das mensagens.
const brandName = 'Casa Árbora'

export default {
  brandName,
  whatsappNumber: '5511942237434', // DDI + DDD + número, só dígitos
  instagramUser: 'casaarbora',
  instagramUrl: 'https://www.instagram.com/casaarbora/',
  mensagens: {
    generica: `Olá, ${brandName}! Gostaria de fazer uma encomenda.`,
    // detalhe e preco também chegam aqui (não usados) — use-os se quiser uma mensagem mais completa
    item: ({ categoria, item, rotulo }) =>
      `Olá, ${brandName}! Gostaria de fazer uma encomenda: ${item} (${categoria}), tamanho ${rotulo}.`,
    kit: (nomeKit) => `Olá, ${brandName}! Gostaria de saber mais sobre o ${nomeKit}.`,
  },
}
