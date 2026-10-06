// Dados da marca — troque aqui nome, WhatsApp, Instagram e textos das mensagens.
const brandName = 'Casa Árbora'
const roteiro = '\nData: \nConvidados: \nRestrições: '

export default {
  brandName,
  whatsappNumber: '5511942237434', // DDI + DDD + número, só dígitos
  instagramUser: 'casaarbora',
  instagramUrl: 'https://www.instagram.com/casaarbora/',
  mensagens: {
    generica: `Olá, ${brandName}! Quero fazer uma encomenda.${roteiro}\nSabor: `,
    item: ({ categoria, item, rotulo, detalhe, preco }) =>
      `Olá, ${brandName}! Quero encomendar: ${categoria} — ${item}, ${rotulo}${detalhe ? ` (${detalhe})` : ''}, ${preco}.${roteiro}`,
    kit: (nomeKit) => `Olá, ${brandName}! Quero saber os valores do ${nomeKit}.${roteiro}`,
  },
}
