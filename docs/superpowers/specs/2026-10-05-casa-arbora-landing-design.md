# Casa Árbora — Landing page (design spec)

Data: 2026-10-05 · Status: aprovado em conversa (rev. 2 — cardápio com abas), aguardando revisão do documento

## 1. Objetivo

Landing page de uma página para a **Casa Árbora**, confeitaria de bolos naturais (sem açúcar refinado; frutas, castanhas, farinhas integrais, adoçantes naturais como tâmara e banana), atendendo o ABC Paulista (SP).

- **Meta principal:** transformar visitas de celular em encomendas pelo WhatsApp.
- **Critério de sucesso:** em qualquer celular de 375–430px, a pessoa entende em segundos que são bolos naturais, encontra o item no cardápio com foto, tamanho e preço, e chega ao WhatsApp com mensagem pronta (item + tamanho) em no máximo 2 toques. Sem scroll horizontal, toque ≥ 44px, texto legível sem zoom.
- **Posicionamento (opção B):** mensagem principal = "bolos naturais"; diferencial secundário = públicos atendidos (baby friendly, APLV, celíacos, diabéticos, galactosemia sob anamnese, veganos).

### Dados reais (de casaarbora.com e do cardápio em PDF)
- Marca: Casa Árbora · Confeiteira: **Tânia** · Instagram: @casaarbora · WhatsApp: (11) 94223-7434 → `5511942237434` · Região: ABC Paulista - SP.
- Regras de encomenda: pedido com pelo menos 5 dias de antecedência; pagamento antecipado confirma (Pix ou link de cartão); entrega/retirada a combinar; frete sob consulta.
- O PDF **não** é linkado no site; o conteúdo dele vira a seção Cardápio.

## 2. Stack e restrições

- Vite (vanilla) + HTML + CSS + JavaScript (módulos ES). GSAP + ScrollTrigger via npm (já instalado).
- Mobile first: CSS escrito para 375–430px; breakpoints `min-width` para 768px e 1100px.
- Animações apenas com `transform` e `opacity`.
- `prefers-reduced-motion` respeitado em tudo.
- Sem backend, carrinho, formulário ou páginas extras.

## 3. Estrutura de arquivos

```
index.html                 # marcação semântica das seções (textos editáveis aqui)
public/images/
  bolo-topo.png            # bolo real visto de cima, recortado em círculo, fundo transparente (animação)
  cardapio/*.jpg           # fotos reais extraídas do PDF, uma por item (nomes descritivos)
  confeiteira.jpg          # placeholder (trocar pela foto da Tânia)
  deco/*                   # folhas e ingredientes decorativos
src/
  config.js                # marca, WhatsApp, Instagram, mensagens prontas
  data/cardapio.js         # categorias, itens, descrições, tamanhos e preços (editar aqui)
  main.js                  # ponto de entrada: importa CSS e inicializa módulos
  styles/tokens.css        # sistema de design (variáveis CSS)
  styles/base.css          # reset, tipografia, utilitários
  styles/components.css    # botões, cards, selos, chips, abas, papel rasgado
  styles/sections.css      # layout de cada seção
  js/menu.js               # menu hambúrguer acessível
  js/whatsapp.js           # gera links wa.me a partir de config.js (função pura + init)
  js/cardapio.js           # renderiza o cardápio a partir de data/cardapio.js, abas e seletor de tamanho
  js/cake-scroll.js        # animação principal do bolo
  js/reveals.js            # fade/slide de entrada + parallax das decorações
```

Cada módulo JS exporta uma função `init*()`; `main.js` orquestra. `cardapio.js` emite um evento (`cardapio:change`) ao trocar de aba para que `cake-scroll.js`/`reveals.js` chamem `ScrollTrigger.refresh()`.

## 4. Sistema de design

Definido na Etapa 1 com a skill ui-ux-pro-max e registrado em `tokens.css`. Partida (pode ser refinada mantendo a identidade):

- **Cores:** creme `#FBF6EE` (fundo), bege `#F3EADB` (superfícies), terracota `~#C0623F` (botões/destaques — ajustar para contraste AA com texto branco), sálvia `~#9CAF88` (detalhes), marinho `~#1F2D4A` (títulos, rodapé), texto corpo marinho suavizado.
- **Fontes:** títulos sans encorpada (ex.: Outfit/Plus Jakarta Sans 800), corpo sans legível, detalhes manuscritos (ex.: Caveat). Google Fonts com `display=swap` e preconnect.
- **Escala tipográfica fluida** com `clamp()`, corpo ≥ 16px.
- **Espaçamento** em base 4/8px; **raios** 16–24px nos cards, pílula nos botões; **sombras** suaves e quentes.
- **UX mobile:** alvos ≥ 44px, foco visível, contraste AA, nada de hover como única affordance.

## 5. Seções (ordem da página)

1. **Header** — logo "Casa Árbora" com folha; fixo e compacto. Mobile: botão hambúrguer (`aria-expanded`, `aria-controls`, fecha com Esc, clique em link ou fora; trava o scroll do body enquanto aberto). Desktop: links inline + botão "Encomendar". Links: Cardápio, Ingredientes, Sobre, Como encomendar.
2. **Hero** — frase manuscrita "Feito à mão, sem açúcar refinado"; título "Bolos de verdade, doces por natureza"; subtítulo (tâmara, banana, frutas secas, farinhas sem glúten); botão "Ver cardápio" (âncora `#cardapio`) e link secundário "Fazer encomenda" (`#encomendar`); 3 selos com ícone: Sem açúcar refinado · Ingredientes naturais · Feito à mão. Espaço reservado para o bolo abaixo do conteúdo no mobile e à direita no desktop.
3. **Faixa de públicos** — fundo sálvia com bordas de papel rasgado; "Para todo mundo comer junto"; chips: Baby friendly, APLV, Sem glúten, Diabéticos, Vegano, Sem galactose*; nota "*sob anamnese prévia".
4. **Cardápio** (`#cardapio`) — substitui "Nossos bolos".
   - **Abas** (chips que quebram linha, nunca scroll lateral): Clássicos · Festa · Veganos · Docinhos · Muffins · Granola. Padrão ARIA tabs (`role="tablist"`, `aria-selected`, setas ←/→, Home/End). Uma categoria visível por vez; "Clássicos" aberta por padrão.
   - **Cabeçalho da categoria:** subtítulo curto + nota da categoria (ex.: "Não contém açúcar, lactose, glúten, corantes ou conservantes. Adoçado com frutas frescas e secas, 100% vegano." / Veganos: "Adoçados com açúcar demerara orgânico.").
   - **Card de item** (padrão do PDF): foto real redonda/arredondada, nome, descrição, **seletor de tamanho** (botões de rádio estilizados, ≥ 44px) mostrando para cada opção rótulo + pedaços/quantidade + peso + preço; preço do tamanho selecionado em destaque; botão "Encomendar" que abre o WhatsApp com item + tamanho. Itens com opção única (docinhos, muffins) mostram a opção sem seletor.
   - Docinhos e muffins: card por sabor, opção única (caixa 15 un. R$ 90 / caixa 24 un. R$ 120 — mesmo sabor).
   - Layout: 1 coluna no mobile, 2 no tablet, 3 no desktop.
   - Fallback `<noscript>`: texto com link para o WhatsApp.
5. **Ingredientes** — estilo "What's Inside": 8 ícones SVG ilustrados com legenda (banana, tâmara, castanhas, cacau, mirtilos/frutas vermelhas, limão, coco, aveia). Grade 4×2 no mobile, linha única no desktop.
6. **Sobre a confeiteira** — "Oi, eu sou a Tânia": foto arredondada (placeholder), parágrafo curto da história (placeholder marcado), assinatura manuscrita "Conte comigo! — Tânia".
7. **Depoimentos** — 3 cards (aspas, texto, nome, cidade do ABC). Empilhados no mobile (sem carrossel). Exemplos fictícios marcados com comentário `<!-- TROCAR -->`.
8. **Como encomendar** (`#encomendar`) — 4 passos numerados: escolha no cardápio → mande mensagem no WhatsApp (pelo menos 5 dias antes) → pagamento antecipado confirma (Pix ou cartão) → entrega ou retirada a combinar (frete sob consulta); botão grande "Pedir pelo WhatsApp" (mensagem genérica).
9. **Rodapé** — marinho, borda rasgada no topo, frase manuscrita "Feito com muito carinho", ícones Instagram e WhatsApp, "ABC Paulista - SP", copyright.

Decorações (folhas, castanhas, frutas) ficam absolutas nas bordas das seções, com `overflow-x: clip` nas seções para nunca gerar scroll horizontal.

## 6. Dados do cardápio (`src/data/cardapio.js`)

Formato:

```js
export const categorias = [
  {
    id: 'classicos', nome: 'Clássicos', subtitulo: 'Bolos de uma camada',
    nota: 'Não contém açúcar, lactose, glúten, corantes ou conservantes. Adoçado com frutas frescas e secas, 100% vegano.',
    itens: [
      {
        id: 'classico-cacau-tamaras', nome: 'Cacau & Tâmaras',
        descricao: 'Massa de cacau e tâmaras, decorado com gotas de chocolate baby friendly e finalizado com physalis.',
        foto: '/images/cardapio/classico-cacau-tamaras.jpg',
        opcoes: [
          { rotulo: 'Pequeno', detalhe: '7 a 9 pedaços · 800 g', preco: 120 },
          { rotulo: 'Médio', detalhe: '12 a 14 pedaços · 1,2 kg', preco: 210 },
        ],
      },
    ],
  },
]
```

Conteúdo (transcrito do PDF; corrigido "800kg" → 800 g):

- **Clássicos (uma camada)** — P 7–9 pedaços · 800 g; M 12–14 pedaços · 1,2 kg.
  - Limão Siciliano & Mirtilos — R$ 120 / R$ 210
  - Banana & Maçã — R$ 120 / R$ 210
  - Cacau & Tâmaras — R$ 120 / R$ 210
  - Banana & Amoras — R$ 140 / R$ 230
  - Pera & Amêndoas — R$ 140 / R$ 230
  - Cenoura, Damasco & Cacau (com ganache) — R$ 180 / R$ 290
- **Festa (duas camadas)** — P 12–14 pedaços · 1,2 kg R$ 280; M 22–24 pedaços · 2,2 kg R$ 388. Itens: Cacau & Tâmaras, Limão Siciliano & Mirtilos, Damasco & Banana. Nota extra: "Transportar com cuidado."
- **Veganos** (açúcar demerara orgânico) — P 7–9 pedaços · 800 g R$ 120; M 12–14 pedaços · 1,2 kg R$ 160. Itens: Chocolatudo, Laranja, Limão Siciliano, Chocolate & Banana, Cenoura & Tâmara, Baunilha (descrição curta escrita a partir do nome, marcada para revisão).
- **Docinhos baby friendly** — caixa com 15 (forminhas nº 5) R$ 90 (R$ 6 cada), um sabor por caixa: Cacau & Avelã, Beijinho, Cajuzinho.
- **Muffins** — caixa com 24 do mesmo sabor R$ 120: Banana, Cacau, Cenoura. Nota: "Pode congelar! Ótimo lanche para a escolinha."
- **Granola artesanal** — 300 g R$ 40; 500 g R$ 75. Sem lactose, glúten, corantes ou conservantes; adoçada com açúcar de coco e passas; baixo índice glicêmico.

Preços formatados com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

## 7. Animação principal — bolo no scroll

- Imagem: foto real do Clássico Cacau & Tâmaras (vista de cima), recortada em círculo com fundo transparente → `bolo-topo.png`.
- Elemento `.cake-layer` em `position: fixed`, `pointer-events: none`, `z-index` abaixo do conteúdo.
- Hero e Cardápio têm fundo transparente (creme vem do `body`); cards e abas são opacos e com z-index acima do bolo, então o bolo passa **por trás** deles e nunca cobre botões ou textos de card. A faixa de públicos (entre hero e cardápio) é opaca e passa por cima do bolo.
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
- Mensagem do cardápio: "Olá, Casa Árbora! Quero encomendar: {categoria} {item} — {tamanho} ({detalhe}), {preço}." Atualizada ao trocar o tamanho.
- Mensagem genérica: "Olá, Casa Árbora! Quero fazer uma encomenda."
- Fallback sem JS: `href` base `https://wa.me/5511942237434`.

## 10. Imagens

- **Cardápio:** fotos reais extraídas do PDF, otimizadas (redimensionadas para ~800px no maior lado, JPEG/WebP de qualidade ~80), uma por item. Itens sem foto própria no PDF (ex.: muffins por sabor, granola) usam a foto da categoria.
- **Placeholders** (Unsplash, baixados localmente): foto da confeiteira e decorações que faltarem. Marcados no README.
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

## 13. Entrega

Screenshots mobile, resumo das correções da auditoria e guia de onde trocar imagens, textos, cardápio/preços, marca e número do WhatsApp (também no README).
