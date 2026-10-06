# Casa Árbora — Landing page (design spec)

Data: 2026-10-05 · Status: aprovado em conversa (rev. 3 — cardápio revisado + selos), aguardando revisão do documento

## 1. Objetivo

Landing page de uma página para a **Casa Árbora**, confeitaria de bolos e doces especiais — Baby Friendly, veganos, feitos sob encomenda com ingredientes selecionados, sem açúcar refinado — atendendo o ABC Paulista (SP).

- **Meta principal:** transformar visitas de celular em encomendas pelo WhatsApp.
- **Critério de sucesso:** em qualquer celular de 375–430px, a pessoa entende em segundos que são bolos naturais, encontra o item no cardápio com foto, tamanho e preço, e chega ao WhatsApp com mensagem pronta (item + tamanho) em no máximo 2 toques. Sem scroll horizontal, toque ≥ 44px, texto legível sem zoom.
- **Posicionamento (opção B):** mensagem principal = "bolos naturais"; diferencial secundário = Baby Friendly (a partir de 9 meses), veganos, sem glúten, restrições alimentares e galactosemia sob anamnese.

### Fontes de conteúdo (decisão: opção A)
- **Textos e preços:** `Downloads/cardapio-casa-arbora-revisado (1).pdf` (bate com `CAKES_setembro2026.pdf`). A expressão "baixo índice glicêmico" **não** é usada.
- **Exceção:** Bolo Mandala de Morango (sazonal, "consultar disponibilidade") vem de `Cardapio_gpt_26_fotos_tratadas.pdf`, com os preços desse arquivo.
- **Fotos:** extraídas de `CAKES_setembro2026.pdf` e `Cardapio_gpt_26_fotos_tratadas.pdf` (as versões "tratadas" têm prioridade quando houver as duas).
- **Selos:** imagens enviadas — Baby Friendly, Sem Glúten, 100% Vegano — recortadas em círculo com fundo transparente.
- **Dados de contato:** Casa Árbora · Confeiteira **Tânia** · Instagram @casaarbora · WhatsApp (11) 94223-7434 → `5511942237434` · ABC Paulista - SP.
- **Encomendas:** enviar data da festa, número de convidados, restrições alimentares e sabor; pedido com pelo menos 5 dias de antecedência; pagamento antecipado confirma (Pix ou link de cartão); entrega ou retirada a combinar; frete sob consulta. A chave Pix **não** é exibida no site (é passada no atendimento).

## 2. Stack e restrições

- Vite (vanilla) + HTML + CSS + JavaScript (módulos ES). GSAP + ScrollTrigger via npm (já instalado).
- Mobile first: CSS escrito para 375–430px; breakpoints `min-width` para 768px e 1100px.
- Animações apenas com `transform` e `opacity`.
- `prefers-reduced-motion` respeitado em tudo.
- Sem backend, carrinho, formulário ou páginas extras. O PDF não é linkado.

## 3. Estrutura de arquivos

```
index.html                 # marcação semântica das seções (textos editáveis aqui)
public/images/
  bolo-topo.png            # bolo real visto de cima, recortado em círculo, fundo transparente (animação)
  cardapio/*.jpg           # fotos reais, uma por item (nomes = id do item)
  selos/baby-friendly.png, sem-gluten.png, vegano.png   # selos com fundo transparente
  deco/*                   # folhas e ingredientes decorativos
src/
  config.js                # marca, WhatsApp, Instagram, mensagens prontas
  data/cardapio.js         # categorias, itens, descrições, tags, tamanhos e preços (editar aqui)
  main.js                  # ponto de entrada: importa CSS e inicializa módulos
  styles/tokens.css        # sistema de design (variáveis CSS)
  styles/base.css          # reset, tipografia, utilitários
  styles/components.css    # botões, cards, selos, tags, abas, papel rasgado
  styles/sections.css      # layout de cada seção
  js/menu.js               # menu hambúrguer acessível
  js/whatsapp.js           # gera links wa.me a partir de config.js (função pura + init)
  js/cardapio.js           # renderiza o cardápio a partir de data/cardapio.js, abas e seletor de tamanho
  js/cake-scroll.js        # animação principal do bolo
  js/reveals.js            # fade/slide de entrada + parallax das decorações
```

Cada módulo JS exporta uma função `init*()`; `main.js` orquestra. `cardapio.js` emite o evento `cardapio:change` ao trocar de aba; quem depende de layout chama `ScrollTrigger.refresh()`.

## 4. Sistema de design

Definido na Etapa 1 com a skill ui-ux-pro-max e registrado em `tokens.css`. Partida (pode ser refinada mantendo a identidade e harmonizando com os selos, que usam verde-oliva `~#6B7F3A`, caramelo `~#A87B4F` e creme):

- **Cores:** creme `#FBF6EE` (fundo), bege `#F3EADB` (superfícies), terracota `~#C0623F` (botões/destaques — ajustar para contraste AA com texto branco), sálvia/oliva (detalhes, tags), marinho `~#1F2D4A` (títulos, rodapé), texto corpo marinho suavizado.
- **Fontes:** títulos sans encorpada (ex.: Outfit/Plus Jakarta Sans 800), corpo sans legível, detalhes manuscritos (ex.: Caveat). Google Fonts com `display=swap` e preconnect.
- **Escala tipográfica fluida** com `clamp()`, corpo ≥ 16px.
- **Espaçamento** em base 4/8px; **raios** 16–24px nos cards, pílula nos botões; **sombras** suaves e quentes.
- **UX mobile:** alvos ≥ 44px, foco visível, contraste AA, nada de hover como única affordance.

## 5. Seções (ordem da página)

1. **Header** — logo "Casa Árbora" com folha; fixo e compacto. Mobile: botão hambúrguer (`aria-expanded`, `aria-controls`, fecha com Esc, clique em link ou fora; trava o scroll do body enquanto aberto). Desktop: links inline + botão "Encomendar". Links: Cardápio, Ingredientes, Como encomendar.
2. **Hero** — frase manuscrita "Feito à mão, sem açúcar refinado"; título "Bolos de verdade, doces por natureza"; subtítulo "Bolos e doces Baby Friendly e veganos, adoçados com frutas frescas e secas. Feitos sob encomenda no ABC Paulista."; botão "Ver cardápio" (`#cardapio`) e link secundário "Fazer encomenda" (`#encomendar`); 3 selos com ícone: Sem açúcar refinado · Ingredientes naturais · Feito à mão. Espaço reservado para o bolo abaixo do conteúdo no mobile e à direita no desktop.
3. **Como escolher** (faixa sálvia com bordas de papel rasgado) — título "Para todo mundo comer junto"; os 3 selos-imagem com legenda curta:
   - **Baby Friendly** — a partir de 9 meses. Sem açúcar adicionado, sem adoçantes, sem polióis, sem glúten, sem leite, sem lactose, sem caseína e sem ingredientes de origem animal. Adoçado com frutas frescas e secas.
   - **Sem glúten** — toda a linha Baby Friendly, os bolos veganos e a granola.
   - **100% Vegano** — sem ingredientes de origem animal. A linha vegana tradicional é adoçada com açúcar demerara orgânico.
   - Nota: "Tem alergia, intolerância ou galactosemia? Conte antes de encomendar — avaliamos preparo e risco de contaminação cruzada. Galactosemia: somente sob anamnese prévia."
4. **Cardápio** (`#cardapio`)
   - **Abas** (chips que quebram linha, nunca scroll lateral): Clássicos · Festa · Veganos · Docinhos · Muffins · Granola · Kits. Padrão ARIA tabs (`role="tablist"`, `aria-selected`, setas ←/→, Home/End). Uma categoria por vez; "Clássicos" aberta por padrão.
   - **Cabeçalho da categoria:** subtítulo + nota (ex.: tamanhos padrão da categoria, "Transporte com cuidado…").
   - **Card de item** (padrão do PDF): foto real arredondada; tags pequenas (BF / Vegano / Sazonal / Sob consulta) usando mini-selos; nome; descrição; **seletor de tamanho** (rádios estilizados ≥ 44px) mostrando rótulo + fatias/quantidade + peso + preço; preço do tamanho selecionado em destaque; botão "Encomendar" → WhatsApp com item + tamanho. Itens de opção única mostram a opção sem seletor. Kits mostram "Valores sob consulta" e botão "Consultar".
   - Layout: 1 coluna no mobile, 2 no tablet, 3 no desktop.
   - Fallback `<noscript>`: texto com link para o WhatsApp.
5. **Ingredientes** — estilo "What's Inside": 8 ícones SVG ilustrados com legenda (banana, tâmara, cacau, frutas vermelhas, limão siciliano, coco, castanhas, maçã). Grade 4×2 no mobile, linha única no desktop.
6. **Depoimentos** — 3 cards (aspas, texto, nome, cidade do ABC). Empilhados no mobile (sem carrossel). Exemplos fictícios marcados com comentário `<!-- TROCAR -->`.
7. **Como encomendar** (`#encomendar`) — 4 passos: (1) escolha no cardápio; (2) mande no WhatsApp a data, nº de convidados, restrições e sabor — com pelo menos 5 dias de antecedência; (3) o pagamento antecipado confirma (Pix ou cartão); (4) entrega ou retirada a combinar (frete sob consulta). Botão grande "Pedir pelo WhatsApp" (mensagem genérica com o roteiro). Linha final: "Ao postar, marque @casaarbora 💛".
8. **Rodapé** — marinho, borda rasgada no topo, frase manuscrita "Feito com muito carinho", ícones Instagram e WhatsApp, "ABC Paulista - SP", copyright.

Decorações (folhas, castanhas, frutas) ficam absolutas nas bordas das seções, com `overflow-x: clip` nas seções para nunca gerar scroll horizontal.

## 6. Dados do cardápio (`src/data/cardapio.js`)

Formato:

```js
export const categorias = [
  {
    id: 'classicos', nome: 'Clássicos', subtitulo: 'Baby Friendly · uma camada',
    nota: 'Pequeno: 9 a 10 fatias, 900 g · Médio: 12 a 14 fatias, 1,2 kg.',
    itens: [
      {
        id: 'classico-cacau-tamaras', nome: 'Cacau & Tâmaras', tags: ['bf'],
        descricao: 'Massa de cacau 100% e tâmaras. Decorado com gotas de chocolate Baby Friendly e finalizado com physalis.',
        foto: '/images/cardapio/classico-cacau-tamaras.jpg',
        opcoes: [
          { rotulo: 'Pequeno', detalhe: '9 a 10 fatias · 900 g', preco: 160 },
          { rotulo: 'Médio', detalhe: '12 a 14 fatias · 1,2 kg', preco: 230 },
        ],
      },
    ],
  },
]
```

`preco: null` = "sob consulta". Preços formatados com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })`.

Conteúdo:

- **Clássicos** (Baby Friendly, uma camada) — P 9–10 fatias · 900 g R$ 160; M 12–14 fatias · 1,2 kg R$ 230:
  - Limão Siciliano & Mirtilos — massa de limão siciliano e mirtilos; finalizado com leite de coco em pó, raspas de limão e physalis.
  - Banana & Amoras — massa de banana, banana passa e amoras; finalizado com physalis e leite de coco em pó.
  - Banana & Maçã — massa de banana com pedaços de maçã; decorado com rodelas de banana, passas, aveia e semente de abóbora; finalizado com leite de coco em pó.
  - Cacau & Tâmaras — massa de cacau 100% e tâmaras; gotas de chocolate Baby Friendly e physalis.
  - Pera & Amêndoas — massa de pera e tâmaras; decorado com peras e amêndoas laminadas; leite de coco em pó.
  - Cenoura, Damasco & Cacau (com ganache de chocolate 50% Baby Friendly) — massa de cenoura e damascos; ganache e physalis. P R$ 180 · M R$ 290.
  - Mandala de Morango (tag **Sazonal — consultar disponibilidade**) — bolo de cacau 100%, tâmaras e frutas secas, coberto com ganache de chocolate 50% e decorado com morangos frescos. P 8–12 fatias · 850 g R$ 190; M 15–17 fatias · 1,5 kg R$ 280.
- **Festa** (Baby Friendly, duas camadas) — P 12–14 fatias · 1,2 kg R$ 280; M 22–24 fatias · 2,2 kg R$ 388. Nota: "Transporte com cuidado para preservar estrutura, cobertura e decoração."
  - Limão Siciliano & Mirtilos — recheio de creme de limão; cobertura de creme de limão, mirtilos frescos, physalis e raspas de limão.
  - Cacau & Tâmaras — massa de cacau 100%, tâmaras e frutas secas; recheio de frutas vermelhas e creme de cacau; cobertura de creme de cacau com frutas frescas.
  - Damasco & Banana — massa de damascos e banana; recheio de frutas vermelhas com creme de laranja e damasco; cobertura de creme de laranja, damascos e frutas vermelhas frescas.
- **Veganos** (tag VG e Sem glúten; adoçados com açúcar demerara orgânico; sem corantes ou conservantes) — P 7–9 fatias · 800 g R$ 120; M 12–14 fatias · 1,2 kg R$ 160. Um card por sabor: Chocolatudo, Limão Siciliano, Chocolate & Banana, Cenoura & Tâmara, Baunilha. Descrição padrão: "Bolo vegano de {sabor}, adoçado com açúcar demerara orgânico." (sem inventar ingredientes; a linha será refeita pela Tânia no cardápio novo).
- **Docinhos** (BF; forminhas de papel nº 5) — caixa com 15 do mesmo sabor R$ 90 (R$ 6 cada):
  - Cacau & Avelã — avelãs, tâmaras, frutas secas, cacau 100%, baunilha e flor de sal.
  - Beijinho — damasco, frutas secas, coco e laranja.
  - Cajuzinho — castanha de caju, pasta de amendoim, frutas secas, uva passa e baunilha.
- **Muffins** (BF; "Ótimo para o lanche da escola. Pode congelar.") — caixa com 24 do mesmo sabor R$ 120:
  - Cenoura — massa de damasco e cenoura com recheio de gotas de chocolate Baby Friendly.
- **Granola** (VG, sem glúten) — Granola Artesanal: aveia, sementes de girassol e abóbora, fios de coco, passas branca e preta, nibs de cacau, gergelim, amêndoas, castanha do Pará, óleo e açúcar de coco, canela e sal rosa. Pacote médio 300 g R$ 40; grande 600 g R$ 75.
- **Kits** (tag Sob consulta; `preco: null`; botão "Consultar"):
  - Kit Primeira Festinha — bolo Baby Friendly + 15 docinhos.
  - Kit Escolinha — 24 muffins + docinhos.
  - Kit Festa Baby Friendly — bolo de duas camadas + 30 docinhos.

## 7. Animação principal — bolo no scroll

- Imagem: foto real do Clássico Cacau & Tâmaras (vista de cima), recortada em círculo com fundo transparente → `bolo-topo.png`.
- Elemento `.cake-layer` em `position: fixed`, `pointer-events: none`, `z-index` abaixo do conteúdo.
- Hero e Cardápio têm fundo transparente (creme vem do `body`); cards e abas são opacos e com z-index acima do bolo, então o bolo passa **por trás** deles e nunca cobre botões ou textos de card. A faixa "Como escolher" é opaca e passa por cima do bolo.
- Timeline GSAP com ScrollTrigger: início no topo da página, fim quando o fim de `#cardapio` chega ao fim da viewport (`endTrigger: '#cardapio'`, `end: 'bottom bottom'`), `scrub` com leve suavização. Anima `rotation` (≈ 360–540°), `scale` (1 → 0), `x/y` (desliza para o canto) e `opacity` (1 → 0). Rolar para cima reverte naturalmente. `invalidateOnRefresh: true`; `ScrollTrigger.refresh()` ao trocar de aba e após carregar imagens.
- **Mobile:** bolo grande na metade inferior da viewport, abaixo de título/selos/CTA, parcialmente cortado pela borda direita; posição/tamanho por breakpoint via variáveis CSS aplicadas em transform.
- **Desktop:** bolo grande à direita do texto do hero.
- **Reduced motion:** via `gsap.matchMedia()`; com `(prefers-reduced-motion: reduce)` o bolo é exibido estático no hero (fluxo normal, sem fixed) e nenhuma timeline é criada.
- `will-change: transform` apenas no elemento animado.

## 8. Animações secundárias

- Títulos e cards: fade + deslize de ~24px ao entrar (ScrollTrigger `once`), com pequeno stagger nos cards. Ao trocar de aba, os novos cards entram com fade curto (≤ 250ms).
- Decorações: parallax leve (`yPercent` com scrub) — amplitude pequena.
- Tudo desligado com reduced motion. Nada compete com o bolo.

## 9. WhatsApp

- `config.js` exporta `brandName`, `whatsappNumber`, `instagramUser` e os modelos de mensagem.
- `whatsapp.js` exporta `buildWhatsAppUrl(texto)` → `https://wa.me/<numero>?text=<encodeURIComponent(texto)>` e aplica em elementos `[data-whatsapp]` (`target="_blank"`, `rel="noopener"`).
- Mensagem de item: "Olá, Casa Árbora! Gostaria de fazer uma encomenda: {item} ({categoria}), tamanho {tamanho}." (ex.: "… Cacau & Tâmaras (Clássicos), tamanho Médio."). Atualizada ao trocar o tamanho. Detalhe e preço não entram na mensagem (ajustes v2: mensagens mais simples).
- Mensagem de kit: "Olá, Casa Árbora! Gostaria de saber mais sobre o {kit}."
- Mensagem genérica: "Olá, Casa Árbora! Gostaria de fazer uma encomenda." (sem roteiro de Data/Convidados/Restrições — o passo 2 de "Como encomendar" orienta o que contar na conversa).
- Fallback sem JS: `href` base `https://wa.me/5511942237434`.

## 10. Imagens

- **Cardápio:** fotos reais dos PDFs, recortadas/otimizadas (~800px no maior lado, JPEG ~80), uma por item, nome = id do item. Itens sem foto própria usam a melhor foto da categoria (ex.: veganos sem foto, muffins por sabor, kits); o mapeamento item → foto é revisado visualmente numa folha de contato antes de fechar.
- **Selos:** `2.jpg`, `3.jpg`, `4.jpg` enviados → PNG com fundo transparente (recorte circular).
- **Placeholders:** decorações são SVG próprios e recortes das fotos reais. Marcados no README.
- `width`/`height` explícitos, `loading="lazy"` fora do hero, `alt` descritivo.
- README com a tabela "o que trocar e onde".

## 11. Testes (Playwright MCP)

Rodados após a implementação e novamente após o polimento:
- Larguras 375, 390, 430, 768, 1440: screenshot de cada seção.
- Scroll em 0%, 25%, 50%, 75%: screenshots + leitura de `transform`/`opacity` computados para conferir rotação, encolhimento e desaparecimento no fim de `#cardapio`.
- `document.documentElement.scrollWidth <= innerWidth` em todas as larguras e em todas as abas do cardápio.
- Menu mobile abre/fecha (`aria-expanded` e visibilidade).
- Abas do cardápio trocam a categoria; seletor de tamanho atualiza preço e `href`.
- Botões de WhatsApp com `href` correto (número + texto codificado).
- Emulação de reduced motion: bolo estático, sem timeline.
- Console sem erros.

## 12. Polimento (impeccable)

Após tudo funcionando: auditoria de contraste, alinhamento, espaçamento, hierarquia, estados hover/foco/toque, acessibilidade e detalhes visuais; corrigir tudo o que for apontado; repetir os testes.

## 13. Pendências de conteúdo (o que falta e precisa ser providenciado)

Itens marcados assim aparecem em três lugares: (a) nesta tabela; (b) no código, com comentário `TODO(conteúdo)` e, nos dados do cardápio, o campo `pendente: ['foto' | 'descricao' | 'foto-baixa-resolucao']`; (c) **no site em modo de desenvolvimento** (`npm run dev`), com uma etiqueta tracejada "PENDENTE: …" sobre o elemento. A etiqueta **não** aparece no build de produção (`import.meta.env.DEV`).

### Fotos já mapeadas (origem → item)
| Item | Foto | Origem |
|---|---|---|
| Clássico Limão Siciliano & Mirtilos | `gpt p01_9` | fotos tratadas |
| Clássico Banana & Amoras | `set p01_21` | setembro |
| Clássico Banana & Maçã | `set p01_20` | setembro |
| Clássico Cacau & Tâmaras (+ `bolo-topo.png`) | `set p01_19` | setembro |
| Clássico Pera & Amêndoas | `set p01_3` | setembro |
| Cenoura, Damasco & Cacau (ganache) | `gpt p01_13` | fotos tratadas |
| Mandala de Morango | `gpt p01_0` | fotos tratadas |
| Festa Limão & Mirtilos / Cacau & Tâmaras / Damasco & Banana | `set p01_5` / `set p01_6` / `set p01_7` | setembro |
| Veganos Chocolatudo / Limão / Cenoura & Tâmara / Baunilha | `set p01_8` / `set p01_10` / `set p01_11` / `set p01_9` | setembro |
| Docinhos Cacau & Avelã / Beijinho / Cajuzinho | `set p01_12` / `set p01_14` / `set p01_13` | setembro |
| Muffin Cenoura | `set p01_17` | setembro |
| Granola | `set p01_15` (+ embalagem `set p01_16`) | setembro |
| Logos (wordmark no header e rodapé; planta + wordmark no preloader; planta nos ícones) | `logos.pdf` pág. 2, variações 6 / 0 / 1 (ajustes v2) | logos |
| Faixa "Como encomendar" / decoração | `set p01_18`, `gpt p01_17` | ambos |

### Pendentes
| # | O quê | Situação no site até chegar | Onde trocar |
|---|---|---|---|
| P4 | **Kits:** a Tânia vai calcular os preços e montar as fotos | sob consulta, com composição provisória de fotos | `src/data/cardapio.js`, `public/images/cardapio/kit-*.jpg` |
| P5 | **Foto em boa resolução: Vegano Chocolate & Banana** | usa a foto do PDF antigo (~550px, aceitável no celular) | `public/images/cardapio/vegano-chocolate-banana.jpg` |
| P6 | **Linha vegana será refeita pela Tânia no cardápio novo** (sabores, descrições e fotos) | texto padrão "Bolo vegano de {sabor}, adoçado com açúcar demerara orgânico." | `src/data/cardapio.js` |
| P9 | **Depoimentos reais** (3, com nome e cidade, com autorização) | 3 exemplos fictícios | `index.html` → seção `#depoimentos` |
| P10 | **Logo em vetor (SVG) ou PNG em alta** | resolvida para web com as variações raster 1000px do PDF de logos; SVG vetorial ainda ideal | `public/images/logo.*`, `logo-claro.*`, `logo-preloader.*` |
| P13 | Domínio/hospedagem e imagem de compartilhamento (Open Graph) | fora do escopo; OG usa foto do bolo de festa | `index.html` `<meta property="og:image">` |
| P14 | **Preços em revisão:** a Tânia vai recalcular os custos de todos os itens | preços atuais mantidos | `src/data/cardapio.js` |

## 14. Entrega

Screenshots mobile, resumo das correções da auditoria e guia de onde trocar imagens, textos, cardápio/preços, marca e número do WhatsApp (também no README).
