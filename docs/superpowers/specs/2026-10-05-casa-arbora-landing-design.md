# Casa Árbora — Landing page (design spec)

Data: 2026-10-05 · Status: aprovado em conversa, aguardando revisão do documento

## 1. Objetivo

Landing page de uma página para a **Casa Árbora**, confeitaria de bolos naturais (sem açúcar refinado; frutas, castanhas, farinhas integrais, adoçantes naturais como tâmara e banana), atendendo o ABC Paulista (SP).

- **Meta principal:** transformar visitas de celular em encomendas pelo WhatsApp.
- **Critério de sucesso:** em qualquer celular de 375–430px, a pessoa entende em segundos que são bolos naturais, vê os sabores e chega ao WhatsApp com mensagem pronta em no máximo 2 toques. Sem scroll horizontal, toque ≥ 44px, texto legível sem zoom.
- **Posicionamento (opção B):** mensagem principal = "bolos naturais"; diferencial secundário = públicos atendidos (baby friendly 9m+, diabéticos, opções sem glúten, sem lactose e veganas — sob consulta).

### Dados reais (de casaarbora.com)
- Marca: Casa Árbora · Instagram: @casaarbora · WhatsApp: (11) 94223-7434 → `5511942237434` · Região: ABC Paulista - SP · Há um cardápio em PDF no site atual (link será configurável).

## 2. Stack e restrições

- Vite (vanilla) + HTML + CSS + JavaScript (módulos ES). GSAP + ScrollTrigger via npm (já instalado).
- Mobile first: CSS escrito para 375–430px; breakpoints `min-width` para 768px e 1100px.
- Animações apenas com `transform` e `opacity`.
- `prefers-reduced-motion` respeitado em tudo.
- Sem backend, carrinho, preços, formulário ou páginas extras.

## 3. Estrutura de arquivos

```
index.html                 # marcação semântica das seções (textos editáveis aqui)
public/images/             # fotos placeholder (trocar pelas reais, mesmo nome)
  bolo-topo.png            # bolo visto de cima, fundo transparente (animação)
  bolo-banana-aveia.jpg, bolo-cenoura-cacau.jpg, bolo-maca-canela.jpg
  confeiteira.jpg
  folha-*.svg / deco-*.png # decorações das bordas
src/
  config.js                # marca, WhatsApp, Instagram, link do cardápio, mensagens prontas
  main.js                  # ponto de entrada: importa CSS e inicializa módulos
  styles/tokens.css        # sistema de design (variáveis CSS)
  styles/base.css          # reset, tipografia, utilitários
  styles/components.css    # botões, cards, selos, chips, papel rasgado
  styles/sections.css      # layout de cada seção
  js/menu.js               # menu hambúrguer acessível
  js/whatsapp.js           # gera links wa.me a partir de config.js
  js/cake-scroll.js        # animação principal do bolo
  js/reveals.js            # fade/slide de entrada + parallax das decorações
```

Cada módulo JS exporta uma função `init*()` sem dependência dos outros; `main.js` só orquestra.

## 4. Sistema de design

Definido na Etapa 1 com a skill ui-ux-pro-max e registrado em `tokens.css`. Partida (pode ser refinada mantendo a identidade):

- **Cores:** creme `#FBF6EE` (fundo), bege `#F3EADB` (superfícies), terracota `~#C0623F` (botões/destaques — ajustar para contraste AA com texto branco), sálvia `~#9CAF88` (detalhes), marinho `~#1F2D4A` (títulos, rodapé), texto corpo marinho suavizado.
- **Fontes:** títulos sans encorpada (ex.: Outfit/Plus Jakarta Sans 800), corpo sans legível, detalhes manuscritos (ex.: Caveat). Google Fonts com `display=swap` e preconnect.
- **Escala tipográfica fluida** com `clamp()`, corpo ≥ 16px.
- **Espaçamento** em base 4/8px; **raios** 16–24px nos cards, pílula nos botões; **sombras** suaves e quentes.
- **UX mobile:** alvos ≥ 44px, foco visível, contraste AA, nada de hover como única affordance.

## 5. Seções (ordem da página)

1. **Header** — logo "Casa Árbora" com folha; fixo e compacto. Mobile: botão hambúrguer (`aria-expanded`, `aria-controls`, fecha com Esc, clique em link ou fora; trava o scroll do body enquanto aberto). Desktop: links inline + botão "Encomendar".
2. **Hero** — frase manuscrita "Feito à mão, sem açúcar refinado"; título "Bolos de verdade, doces por natureza"; subtítulo (tâmara, banana, farinhas integrais); botão "Fazer encomenda" (âncora para #encomendar); 3 selos com ícone: Sem açúcar refinado · Ingredientes naturais · Feito à mão. Espaço reservado para o bolo abaixo do conteúdo no mobile e à direita no desktop.
3. **Faixa de públicos** — fundo sálvia com bordas de papel rasgado; "Para todo mundo comer junto"; chips: Baby friendly 9m+, Diabéticos, Sem glúten, Sem lactose, Vegano; nota "opções sob consulta".
4. **Nossos bolos** (`#bolos`) — 3 cards (empilhados no mobile, grade de 3 no desktop): foto, nome, descrição curta, botão "Encomendar" que abre WhatsApp com o sabor na mensagem. Bolos: Banana com Aveia, Cenoura com Cacau, Maçã com Canela. Link "Ver cardápio completo" (PDF).
5. **Ingredientes** — estilo "What's Inside": 8 ícones SVG ilustrados com legenda (banana, tâmara, castanhas, aveia, cacau, canela, maçã, farinha integral). Grade 4×2 no mobile, linha única no desktop.
6. **Sobre a confeiteira** — foto arredondada, parágrafo curto da história, assinatura manuscrita. Nome e texto são placeholders marcados com comentário.
7. **Depoimentos** — 3 cards (aspas, texto, nome, cidade do ABC). Empilhados no mobile (sem carrossel). Exemplos fictícios marcados com comentário `<!-- TROCAR -->`.
8. **Como encomendar** (`#encomendar`) — 4 passos numerados: escolha o sabor → mande mensagem → combine data e entrega → retire ou receba no ABC; botão grande "Pedir pelo WhatsApp" (mensagem genérica).
9. **Rodapé** — marinho, borda rasgada no topo, frase manuscrita "Feito com amor, sem açúcar refinado", ícones Instagram e WhatsApp, região, copyright.

Decorações (folhas, castanhas, frutas) ficam absolutas nas bordas das seções, com `overflow-x: clip` nas seções para nunca gerar scroll horizontal.

## 6. Animação principal — bolo no scroll

- Elemento `.cake-layer` em `position: fixed`, `pointer-events: none`, `z-index` abaixo do conteúdo.
- Hero e "Nossos bolos" têm fundo transparente (creme vem do `body`); cards são opacos e com z-index acima do bolo, então o bolo passa **por trás** deles e nunca cobre botões ou texto de card.
- Timeline GSAP com ScrollTrigger: `trigger: document.body`, `start: "top top"`, `endTrigger: "#bolos"`, `end: "bottom bottom"` (ou equivalente que termine no fim da seção), `scrub: true` (com leve suavização). Anima `rotation` (≈ 360–540°), `scale` (1 → 0), `x/y` (desliza para o canto) e `opacity` (1 → 0). Rolar para cima reverte naturalmente.
- **Mobile:** bolo grande na metade inferior da viewport, abaixo de título/selos/CTA, parcialmente cortado pela borda direita; posição/tamanho via variáveis CSS por breakpoint (medidos em translate/scale, não width/top animados).
- **Desktop:** bolo grande à direita do texto do hero.
- **Reduced motion:** via `gsap.matchMedia()`; com `(prefers-reduced-motion: reduce)` o bolo é exibido estático no hero (fluxo normal, sem fixed) e nenhuma timeline é criada.
- `will-change: transform` apenas no elemento animado; `ScrollTrigger.refresh()` após carregar imagens.

## 7. Animações secundárias

- Títulos e cards: fade + deslize de ~24px ao entrar (ScrollTrigger `once`), com pequeno stagger nos cards.
- Decorações: parallax leve (`yPercent` com scrub) — amplitude pequena.
- Tudo desligado com reduced motion. Nada compete com o bolo.

## 8. WhatsApp

- `config.js` exporta `whatsappNumber`, `instagram`, `menuPdfUrl`, `brandName` e mensagens.
- Elementos com `data-whatsapp` (e opcional `data-flavor`) recebem `href = https://wa.me/<numero>?text=<mensagem codificada>`, `target="_blank"`, `rel="noopener"`.
- Mensagem por sabor: "Olá, Casa Árbora! Quero encomendar o bolo de {sabor}." Genérica: "Olá, Casa Árbora! Quero fazer uma encomenda."
- Fallback sem JS: o `href` base no HTML já aponta para `https://wa.me/5511942237434` (sem mensagem).

## 9. Imagens placeholder

- Fotos livres de direitos (Unsplash) baixadas para `public/images/` com nomes descritivos; `bolo-topo.png` gerado a partir de foto de bolo visto de cima recortada em círculo com fundo transparente.
- `width`/`height` explícitos, `loading="lazy"` fora do hero, `alt` descritivo.
- README com a tabela "o que trocar e onde".

## 10. Testes (Playwright MCP)

Rodados após a implementação e novamente após o polimento:
- Larguras 375, 390, 430, 768, 1440: screenshot de cada seção.
- Scroll em 0%, 25%, 50%, 75%: screenshots para conferir rotação, encolhimento e desaparecimento no fim de `#bolos` (checar `opacity`/`transform` computados).
- `document.documentElement.scrollWidth <= innerWidth` em todas as larguras.
- Menu mobile abre/fecha (estado `aria-expanded` e visibilidade).
- Botões de WhatsApp com `href` correto (número + texto codificado).
- Emulação de reduced motion: bolo estático, sem timeline.
- Console sem erros.

## 11. Polimento (impeccable)

Após tudo funcionando: auditoria de contraste, alinhamento, espaçamento, hierarquia, estados hover/foco/toque, acessibilidade e detalhes visuais; corrigir tudo o que for apontado; repetir os testes.

## 12. Entrega

Screenshots mobile, resumo das correções da auditoria e guia de onde trocar imagens, textos, marca e número do WhatsApp (também no README).
