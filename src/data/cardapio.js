// Cardápio — edite aqui nomes, descrições, tamanhos e preços.
// preco: null => "Sob consulta". pendente: lista do que falta (aparece só em `npm run dev`).
// TODO(conteúdo) P14: preços em revisão — a Tânia vai recalcular os custos de todos os itens (atualizar os valores abaixo).
const img = (id) => `/images/cardapio/${id}.jpg`

const P_CLASSICO = { rotulo: 'Pequeno', detalhe: '9 a 10 fatias · 900 g', preco: 160 }
const M_CLASSICO = { rotulo: 'Médio', detalhe: '12 a 14 fatias · 1,2 kg', preco: 230 }
const P_FESTA = { rotulo: 'Pequeno', detalhe: '12 a 14 fatias · 1,2 kg', preco: 280 }
const M_FESTA = { rotulo: 'Médio', detalhe: '22 a 24 fatias · 2,2 kg', preco: 388 }
const P_VEGANO = { rotulo: 'Pequeno', detalhe: '7 a 9 fatias · 800 g', preco: 120 }
const M_VEGANO = { rotulo: 'Médio', detalhe: '12 a 14 fatias · 1,2 kg', preco: 160 }
const CAIXA_DOCINHOS = { rotulo: 'Caixa com 15', detalhe: 'mesmo sabor · R$ 6 cada', preco: 90 }
const CAIXA_MUFFINS = { rotulo: 'Caixa com 24', detalhe: 'mesmo sabor', preco: 120 }
const SOB_CONSULTA = { rotulo: 'Sob consulta', detalhe: '', preco: null }

const NOTA_BF = 'Não contém açúcar, lactose, glúten, corantes ou conservantes. Adoçado com frutas frescas e secas, 100% vegano.'

const vegano = (id, nome, extra = {}) => ({
  id: `vegano-${id}`, nome, tags: ['vg', 'sg'],
  descricao: `Bolo vegano de ${nome}, adoçado com açúcar demerara orgânico.`, // TODO(conteúdo) P6: linha vegana será refeita pela Tânia
  foto: img(`vegano-${id}`), alt: `Bolo vegano de ${nome}`,
  opcoes: [P_VEGANO, M_VEGANO], pendente: ['descricao'], ...extra,
})

export const TAGS = {
  bf: { rotulo: 'Baby Friendly', selo: '/images/selos/baby-friendly.png' },
  vg: { rotulo: 'Vegano', selo: '/images/selos/vegano.png' },
  sg: { rotulo: 'Sem glúten', selo: '/images/selos/sem-gluten.png' },
  sazonal: { rotulo: 'Sazonal · consultar disponibilidade' },
  sc: { rotulo: 'Sob consulta' },
}

export const categorias = [
  {
    id: 'classicos', nome: 'Clássicos', subtitulo: 'Baby Friendly · uma camada',
    nota: `Pequeno: 9 a 10 fatias, 900 g · Médio: 12 a 14 fatias, 1,2 kg. ${NOTA_BF}`,
    itens: [
      { id: 'classico-limao-mirtilos', nome: 'Limão Siciliano & Mirtilos', tags: ['bf'],
        descricao: 'Massa de limão siciliano e mirtilos. Finalizado com leite de coco em pó, raspas de limão e physalis.',
        foto: img('classico-limao-mirtilos'), alt: 'Bolo de limão siciliano e mirtilos com physalis', opcoes: [P_CLASSICO, M_CLASSICO] },
      { id: 'classico-banana-amoras', nome: 'Banana & Amoras', tags: ['bf'],
        descricao: 'Massa de banana, banana passa e amoras. Finalizado com physalis e leite de coco em pó.',
        foto: img('classico-banana-amoras'), alt: 'Bolo de banana e amoras visto de cima', opcoes: [P_CLASSICO, M_CLASSICO] },
      { id: 'classico-banana-maca', nome: 'Banana & Maçã', tags: ['bf'],
        descricao: 'Massa de banana com pedaços de maçã. Decorado com rodelas de banana, passas, aveia e semente de abóbora. Finalizado com leite de coco em pó.',
        foto: img('classico-banana-maca'), alt: 'Bolo de banana e maçã com aveia e sementes', opcoes: [P_CLASSICO, M_CLASSICO] },
      { id: 'classico-cacau-tamaras', nome: 'Cacau & Tâmaras', tags: ['bf'],
        descricao: 'Massa de cacau 100% e tâmaras. Decorado com gotas de chocolate Baby Friendly e finalizado com physalis.',
        foto: img('classico-cacau-tamaras'), alt: 'Bolo de cacau e tâmaras com gotas de chocolate', opcoes: [P_CLASSICO, M_CLASSICO] },
      { id: 'classico-pera-amendoas', nome: 'Pera & Amêndoas', tags: ['bf'],
        descricao: 'Massa de pera e tâmaras. Decorado com peras e amêndoas laminadas. Finalizado com leite de coco em pó.',
        foto: img('classico-pera-amendoas'), alt: 'Bolo de pera com amêndoas laminadas', opcoes: [P_CLASSICO, M_CLASSICO] },
      { id: 'classico-cenoura-damasco-cacau', nome: 'Cenoura, Damasco & Cacau', tags: ['bf'],
        descricao: 'Massa de cenoura e damascos. Coberto com ganache de chocolate 50% Baby Friendly e finalizado com physalis.',
        foto: img('classico-cenoura-damasco-cacau'), alt: 'Bolo de cenoura e damasco com ganache de chocolate',
        opcoes: [{ rotulo: 'Pequeno', detalhe: '9 a 10 fatias · 900 g', preco: 180 }, { rotulo: 'Médio', detalhe: '12 a 14 fatias · 1,2 kg', preco: 290 }] },
      { id: 'classico-mandala-morango', nome: 'Mandala de Morango', tags: ['bf', 'sazonal'],
        descricao: 'Bolo de cacau 100%, tâmaras e frutas secas, coberto com ganache de chocolate 50% e decorado com morangos frescos.',
        foto: img('classico-mandala-morango'), alt: 'Bolo coberto com morangos em formato de mandala',
        opcoes: [{ rotulo: 'Pequeno', detalhe: '8 a 12 fatias · 850 g', preco: 190 }, { rotulo: 'Médio', detalhe: '15 a 17 fatias · 1,5 kg', preco: 280 }] },
    ],
  },
  {
    id: 'festa', nome: 'Festa', subtitulo: 'Baby Friendly · duas camadas',
    nota: `Pequeno: 12 a 14 fatias, 1,2 kg · Médio: 22 a 24 fatias, 2,2 kg. Transporte com cuidado para preservar estrutura, cobertura e decoração. ${NOTA_BF}`,
    itens: [
      { id: 'festa-limao-mirtilos', nome: 'Limão Siciliano & Mirtilos', tags: ['bf'],
        descricao: 'Massa de limão siciliano e mirtilos. Recheio de creme de limão. Cobertura de creme de limão, mirtilos frescos, physalis e raspas de limão.',
        foto: img('festa-limao-mirtilos'), alt: 'Bolo de festa branco com mirtilos e physalis', opcoes: [P_FESTA, M_FESTA] },
      { id: 'festa-cacau-tamaras', nome: 'Cacau & Tâmaras', tags: ['bf'],
        descricao: 'Massa de cacau 100%, tâmaras e frutas secas. Recheio de frutas vermelhas e creme de cacau. Cobertura de creme de cacau finalizada com frutas frescas.',
        foto: img('festa-cacau-tamaras'), alt: 'Bolo de festa de cacau coberto de frutas frescas', opcoes: [P_FESTA, M_FESTA] },
      { id: 'festa-damasco-banana', nome: 'Damasco & Banana', tags: ['bf'],
        descricao: 'Massa de damascos e banana. Recheio de frutas vermelhas com creme de laranja e damasco. Cobertura de creme de laranja, damascos e frutas vermelhas frescas.',
        foto: img('festa-damasco-banana'), alt: 'Bolo de festa com morangos, mirtilos e uvas', opcoes: [P_FESTA, M_FESTA] },
    ],
  },
  {
    id: 'veganos', nome: 'Veganos', subtitulo: 'Linha vegana tradicional',
    nota: 'Sem ingredientes de origem animal. Sem glúten. Adoçados com açúcar demerara orgânico. Sem corantes ou conservantes. Pequeno: 7 a 9 fatias, 800 g · Médio: 12 a 14 fatias, 1,2 kg.',
    itens: [
      vegano('chocolatudo', 'Chocolatudo'),
      vegano('limao-siciliano', 'Limão Siciliano'),
      vegano('chocolate-banana', 'Chocolate & Banana', { pendente: ['descricao', 'foto-baixa-resolucao'] }),
      vegano('cenoura-tamara', 'Cenoura & Tâmara'),
      vegano('baunilha', 'Baunilha'),
    ],
  },
  {
    id: 'docinhos', nome: 'Docinhos', subtitulo: 'Baby Friendly',
    nota: `Servidos individualmente em forminhas de papel nº 5. ${NOTA_BF}`,
    itens: [
      { id: 'docinho-cacau-avela', nome: 'Cacau & Avelã', tags: ['bf'], descricao: 'Avelãs, tâmaras, frutas secas, cacau 100%, baunilha e flor de sal.',
        foto: img('docinho-cacau-avela'), alt: 'Docinhos de cacau e avelã', opcoes: [CAIXA_DOCINHOS] },
      { id: 'docinho-beijinho', nome: 'Beijinho', tags: ['bf'], descricao: 'Damasco, frutas secas, coco e laranja.',
        foto: img('docinho-beijinho'), alt: 'Beijinhos de coco', opcoes: [CAIXA_DOCINHOS] },
      { id: 'docinho-cajuzinho', nome: 'Cajuzinho', tags: ['bf'], descricao: 'Castanha de caju, pasta de amendoim, frutas secas, uva passa e baunilha.',
        foto: img('docinho-cajuzinho'), alt: 'Cajuzinhos com amendoim', opcoes: [CAIXA_DOCINHOS] },
    ],
  },
  {
    id: 'muffins', nome: 'Muffins', subtitulo: 'Baby Friendly',
    nota: `Ótimo para o lanche da escola. Pode congelar para ter sempre em casa. ${NOTA_BF}`,
    itens: [
      { id: 'muffin-cenoura', nome: 'Cenoura', tags: ['bf'], descricao: 'Massa de damasco e cenoura com recheio de gotas de chocolate Baby Friendly.',
        foto: img('muffin-cenoura'), alt: 'Muffins de cenoura com gotas de chocolate', opcoes: [CAIXA_MUFFINS] },
    ],
  },
  {
    id: 'granola', nome: 'Granola', subtitulo: 'Artesanal e vegana',
    nota: 'Sem lactose, glúten, corantes ou conservantes. Adoçada com açúcar de coco e passas, 100% vegana.',
    itens: [
      { id: 'granola', nome: 'Granola Artesanal', tags: ['vg', 'sg'],
        descricao: 'Aveia, sementes de girassol e abóbora, fios de coco, passas branca e preta, nibs de cacau, gergelim, amêndoas, castanha do Pará, óleo e açúcar de coco, canela e sal rosa.',
        foto: img('granola'), alt: 'Granola artesanal com coco e castanhas',
        opcoes: [{ rotulo: 'Pacote médio', detalhe: '300 g', preco: 40 }, { rotulo: 'Pacote grande', detalhe: '600 g', preco: 75 }] },
    ],
  },
  {
    id: 'kits', nome: 'Kits', subtitulo: 'Para festas e para a escola',
    nota: 'Valores sob consulta. Conte a data, o número de convidados e as restrições alimentares.',
    itens: [
      { id: 'kit-primeira-festinha', tipo: 'kit', nome: 'Kit Primeira Festinha', tags: ['bf', 'sc'], descricao: 'Bolo Baby Friendly + 15 docinhos.',
        foto: img('kit-primeira-festinha'), alt: 'Bolo de festa e docinhos', opcoes: [SOB_CONSULTA], pendente: ['foto'] }, // TODO(conteúdo) P4: a Tânia vai calcular os preços e montar as fotos dos kits
      { id: 'kit-escolinha', tipo: 'kit', nome: 'Kit Escolinha', tags: ['bf', 'sc'], descricao: '24 muffins + docinhos.',
        foto: img('kit-escolinha'), alt: 'Muffins e docinhos', opcoes: [SOB_CONSULTA], pendente: ['foto'] },
      { id: 'kit-festa-baby-friendly', tipo: 'kit', nome: 'Kit Festa Baby Friendly', tags: ['bf', 'sc'], descricao: 'Bolo de duas camadas + 30 docinhos.',
        foto: img('kit-festa-baby-friendly'), alt: 'Bolo de duas camadas e docinhos', opcoes: [SOB_CONSULTA], pendente: ['foto'] },
    ],
  },
]
