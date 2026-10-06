# Casa Árbora — site

## Rodar
```bash
npm install
npm run dev      # http://localhost:5173 (mostra etiquetas "PENDENTE" no que falta)
npm test         # testes de unidade
npm run build    # gera dist/ para publicar (sem etiquetas)
```

## Onde trocar cada coisa
| O quê | Onde |
|---|---|
| Nome da marca, WhatsApp, Instagram, textos das mensagens | `src/config.js` |
| Itens, descrições, tamanhos e preços do cardápio | `src/data/cardapio.js` |
| Textos das seções (hero, como escolher, sobre, depoimentos, como encomendar, rodapé) | `index.html` |
| Fotos do cardápio | `public/images/cardapio/<id-do-item>.jpg` (quadradas, ~800px) |
| Bolo animado do topo | `public/images/bolo-topo.png` (quadrado, fundo transparente) |
| Foto da Tânia | `public/images/confeiteira.jpg` (retrato 4:5) |
| Logo | `public/images/logo.png` (escuro) e `logo-claro.png` (rodapé), `favicon.png` |
| Selos | `public/images/selos/*.png` |
| Cores, fontes, espaçamentos | `src/styles/tokens.css` |
| Número do WhatsApp nos links sem JavaScript | `index.html` (procure `wa.me/5511942237434`) |

Regerar as imagens a partir dos PDFs: coloque os arquivos em `assets-src/` e rode `python scripts/prepare_assets.py`.

## Pendências de conteúdo
| # | O quê | Situação no site até chegar | Onde trocar |
|---|---|---|---|
| P1 | **Foto: Clássico Maçã, Baunilha & Nozes** | usa foto de Pera & Amêndoas + etiqueta dev | `public/images/cardapio/classico-maca-baunilha-nozes.jpg` |
| P2 | **Foto: Muffin Banana** | usa foto do muffin de cenoura | `public/images/cardapio/muffin-banana.jpg` |
| P3 | **Foto: Muffin Cacau** | usa foto do muffin de cenoura | `public/images/cardapio/muffin-cacau.jpg` |
| P4 | **Fotos: Kits** (Primeira Festinha, Escolinha, Festa) | composição com fotos de bolo + docinhos/muffins | `public/images/cardapio/kit-*.jpg` |
| P5 | **Foto em boa resolução: Veganos Laranja e Chocolate & Banana** | usa a foto do PDF antigo (~550px, aceitável no celular) | `public/images/cardapio/vegano-laranja.jpg`, `vegano-chocolate-banana.jpg` |
| P6 | **Descrição dos 6 bolos veganos** (ingredientes/decoração) | texto padrão "Bolo vegano de {sabor}, adoçado com açúcar demerara orgânico." | `src/data/cardapio.js` |
| P7 | **Foto da Tânia** | placeholder ilustrado | `public/images/confeiteira.jpg` |
| P8 | **História da Tânia** (2–4 frases) | texto provisório marcado | `index.html` → seção `#sobre` |
| P9 | **Depoimentos reais** (3, com nome e cidade, com autorização) | 3 exemplos fictícios | `index.html` → seção `#depoimentos` |
| P10 | **Logo em vetor (SVG) ou PNG em alta** | logo extraído do PDF (500–1000px), vetorizado/limpo | `public/images/logo.svg` |
| P11 | **Confirmação:** veganos tradicionais são sem glúten? | tag "sem glúten" **não** aplicada aos veganos | `src/data/cardapio.js` (campo `tags`) |
| P12 | **Confirmação:** Mandala de Morango segue no cardápio atual? | exibido como "Sazonal — consultar disponibilidade" | `src/data/cardapio.js` |
| P13 | Domínio/hospedagem e imagem de compartilhamento (Open Graph) | fora do escopo; OG usa foto do bolo de festa | `index.html` `<meta property="og:image">` |
