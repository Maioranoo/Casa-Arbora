# Casa Árbora — Bolos de verdade, doces por natureza

Landing page da **Casa Árbora**, confeitaria artesanal do ABC Paulista (SP) que faz bolos e doces **sem açúcar refinado**, **Baby Friendly** e **veganos**, adoçados com frutas frescas e secas.

![Mobile first](https://img.shields.io/badge/mobile-first-B4532F) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) ![GSAP](https://img.shields.io/badge/GSAP-ScrollTrigger-88CE02?logo=greensock&logoColor=white) ![Vitest](https://img.shields.io/badge/testes-Vitest-6E9F18?logo=vitest&logoColor=white)

---

## Para que serve

O site é a vitrine e o canal de pedidos da confeitaria. Ele apresenta a proposta da marca e o cardápio completo, com fotos reais, tamanhos e preços. Leva o visitante direto ao **WhatsApp** com uma mensagem pronta: o item e o tamanho escolhidos já aparecem no texto.

**Objetivo:** transformar visitas, que chegam quase sempre pelo celular, em encomendas. Quem entra entende em segundos o que a Casa Árbora faz, encontra o bolo que quer e chega ao WhatsApp em até dois toques.

## Para quem

- **Famílias com bebês e crianças pequenas** (a partir de 9 meses), que buscam doces sem açúcar adicionado.
- **Pessoas com restrições alimentares:** APLV, celíacos, diabéticos e galactosemia (sob anamnese prévia).
- **Veganos** e quem quer uma opção de doce mais saudável, sem abrir mão do sabor.
- **A própria confeitaria**, que atualiza preços, sabores e fotos editando poucos arquivos.

## Funcionalidades

- **Cardápio em abas** (Clássicos, Festa, Veganos, Docinhos, Muffins, Granola, Kits), gerado a partir de um único arquivo de dados.
- **Seletor de tamanho em cada item:** atualiza o preço e o link do WhatsApp na hora.
- **Pedido pelo WhatsApp** com mensagem pronta (`Olá, Casa Árbora! Gostaria de fazer uma encomenda: …`).
- **Animação principal:** um bolo visto de cima gira, encolhe e some conforme a rolagem (GSAP ScrollTrigger com *scrub*). Ele volta ao rolar para cima e nunca cobre textos no celular.
- **Animações sutis** de entrada e parallax nas decorações.
- **Preloader** com a marca, que fica no mínimo 1 s e tem trava de segurança: se o JavaScript falhar, ele some sozinho em cerca de 6 s.
- **Acessibilidade:** navegação por teclado (abas no padrão ARIA, menu que fecha com Esc), áreas de toque de no mínimo 44 px, contraste AA e respeito a `prefers-reduced-motion`.
- **Desempenho:** imagens em WebP com fallback, *lazy loading* e cerca de 113 KB de imagens no primeiro carregamento.
- **Selos** Baby Friendly, Sem glúten e 100% Vegano, com a definição de cada um.

## Tecnologias

| Área | Ferramenta |
|---|---|
| Base | HTML5, CSS3 (variáveis/tokens, mobile first) e JavaScript (ES Modules) |
| Build e servidor de desenvolvimento | [Vite](https://vite.dev/) |
| Animações | [GSAP](https://gsap.com/) + ScrollTrigger |
| Testes | [Vitest](https://vitest.dev/) + jsdom (60 testes) e [Playwright](https://playwright.dev/) para validação visual em 375, 390, 430, 768 e 1440 px |
| Imagens | Python + PyMuPDF + Pillow (extrai e otimiza as fotos reais do cardápio em PDF) |

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173 (mostra etiquetas "PENDENTE" no que falta)
npm test         # testes de unidade
npm run build    # gera dist/ para publicar (sem etiquetas)
npm run preview  # serve o build localmente
```

## Estrutura

```
index.html              # marcação das seções e textos
src/config.js           # marca, WhatsApp, Instagram e mensagens
src/data/cardapio.js    # cardápio: itens, descrições, tamanhos e preços
src/js/                 # módulos: menu, cardápio, bolo no scroll, reveals, preloader, WhatsApp
src/styles/             # tokens, base, componentes e seções
public/images/          # fotos, logos, selos e ícones
scripts/prepare_assets.py  # gera as imagens a partir dos PDFs em assets-src/
tests/                  # testes Vitest
```

## Autor

Desenvolvido por **João Pedro Maiorano**.

- LinkedIn: [linkedin.com/in/joão-pedro-maiorano](https://www.linkedin.com/in/jo%C3%A3o-pedro-maiorano-28a10a3b8/)
- GitHub: [github.com/Maioranoo](https://github.com/Maioranoo)
