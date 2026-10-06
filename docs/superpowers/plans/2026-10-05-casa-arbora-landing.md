# Casa Árbora Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a landing page mobile first da Casa Árbora (Vite + HTML/CSS/JS + GSAP) com cardápio em abas gerado a partir de dados, pedidos por WhatsApp com mensagem pronta e o bolo que gira, encolhe e some com o scroll até o fim do cardápio.

**Architecture:** Página única estática. `index.html` traz a marcação de todas as seções; o cardápio é renderizado por `src/js/cardapio.js` a partir de `src/data/cardapio.js`. Módulos JS pequenos e independentes (`init*()`), orquestrados por `src/main.js`. Estilo em 4 camadas de CSS (tokens → base → componentes → seções). Imagens reais são extraídas dos PDFs por um script Python reprodutível.

**Tech Stack:** Vite 8, JavaScript ES modules, GSAP 3.15 + ScrollTrigger, Vitest + jsdom (testes de unidade), Playwright MCP (validação visual/e2e), Python 3 + PyMuPDF + Pillow (preparo de imagens), skills ui-ux-pro-max (Etapa 1) e impeccable (Etapa 9).

**Spec:** `docs/superpowers/specs/2026-10-05-casa-arbora-landing-design.md`

## Global Constraints

- Mobile first: CSS base escrito para 375–430px; media queries só `min-width: 768px` e `min-width: 1100px`.
- Sem scroll horizontal em nenhuma largura (`scrollWidth <= innerWidth`).
- Área de toque mínima 44×44px em todo elemento interativo; texto de corpo ≥ 16px.
- Animações só com `transform` e `opacity`; nada de animar width/height/top/left.
- `prefers-reduced-motion: reduce` → bolo estático, sem reveals nem parallax.
- O bolo termina de sumir (scale 0, opacity 0) quando o fim de `#cardapio` chega ao fim da viewport.
- WhatsApp: `5511942237434`; links `https://wa.me/5511942237434?text=<encodeURIComponent(msg)>`, `target="_blank"`, `rel="noopener"`.
- Marca: "Casa Árbora" (com acento). Confeiteira: Tânia. Instagram: @casaarbora. Região: ABC Paulista - SP.
- Textos e preços: exatamente os da seção 6 do spec. Nunca usar "baixo índice glicêmico". Não exibir chave Pix.
- O PDF não é linkado no site.
- Pendências de conteúdo (spec §13) marcadas com `TODO(conteúdo)` no código, campo `pendente` nos dados e etiqueta visível só em `npm run dev`.
- Fontes: Google Fonts com `display=swap` + preconnect.

## Review Focus

1. **Troca de aba depois de rolar** — o fim do ScrollTrigger do bolo precisa ser recalculado; esperado: o bolo continua sumindo exatamente no fim do cardápio, sem saltos. (Teste em Task 6, Step 6.)
2. **Nome de sabor com `&`, acentos e quebras de linha na mensagem** — esperado: o texto chega íntegro no WhatsApp (encode correto). (Teste em Task 3.)
3. **Item com preço `null` (kits)** — esperado: "Sob consulta", botão "Consultar", sem "R$ NaN". (Teste em Task 4.)
4. **Menu aberto + redimensionar para desktop / tocar fora / Esc** — esperado: menu fecha, scroll do body destravado. (Teste em Task 5.)
5. **Imagem que falha ao carregar ou demora** — esperado: card mantém proporção (width/height explícitos) e o layout não pula; ScrollTrigger recalcula no `load`. (Teste em Task 8, Step 5.)

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Marcação de todas as seções, sprite SVG, metas |
| `vite.config.js` | Config do Vitest (jsdom) |
| `scripts/prepare_assets.py` | Extrai/recorta/otimiza imagens dos PDFs → `public/images/` |
| `assets-src/` (gitignored) | PDFs e selos originais |
| `public/images/**` | Imagens finais servidas |
| `src/config.js` | Marca, número, Instagram, mensagens |
| `src/data/cardapio.js` | Categorias, itens, tags, opções, preços, pendências |
| `src/js/whatsapp.js` | `buildWhatsAppUrl`, `initWhatsAppLinks` |
| `src/js/cardapio.js` | `formatPreco`, `mensagemItem`, `renderCardapio`, `initCardapio` |
| `src/js/menu.js` | `initMenu` |
| `src/js/cake-scroll.js` | `initCakeScroll` |
| `src/js/reveals.js` | `initReveals` |
| `src/js/dev-pendentes.js` | `initDevPendentes` (só dev) |
| `src/main.js` | Importa CSS, chama os `init*` |
| `src/styles/tokens.css` | Variáveis do sistema de design |
| `src/styles/base.css` | Reset, tipografia, utilitários |
| `src/styles/components.css` | Botões, tags, cards, abas, rasgado, selos |
| `src/styles/sections.css` | Layout por seção |
| `tests/*.test.js` | Testes Vitest |
| `README.md` | Como rodar + "o que trocar e onde" + pendências |

Remover: `src/style.css` (substituído pelas 4 camadas).

---

### Task 1: Sistema de design (ui-ux-pro-max) e fundação CSS

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`
- Delete: `src/style.css`
- Modify: `index.html` (head), `src/main.js`

**Interfaces:**
- Produces: variáveis CSS usadas por todas as tasks seguintes: `--c-creme --c-bege --c-terracota --c-terracota-escuro --c-salvia --c-oliva --c-caramelo --c-marinho --c-texto --c-texto-suave --c-branco --f-titulo --f-corpo --f-manuscrita --fs-xs --fs-sm --fs-base --fs-lg --fs-xl --fs-2xl --fs-3xl --sp-1..--sp-10 --r-sm --r-md --r-lg --r-pill --sh-sm --sh-md --sh-lg --toque --container --gutter --dur-rapida --ease-saida`. Classes utilitárias `.container`, `.sr-only`, `.manuscrita`, `.secao`.

- [ ] **Step 1: Rodar a skill ui-ux-pro-max** com o pedido: "Confeitaria artesanal de bolos naturais Baby Friendly/veganos, landing mobile first. Paleta de partida: creme #FBF6EE, terracota ~#C0623F, sálvia ~#9CAF88, marinho #1F2D4A; selos usam oliva #6B7F3A e caramelo #A87B4F. Fontes: sans encorpada para títulos, sans legível para corpo, manuscrita para detalhes. Preciso de paleta final com contraste AA, par de fontes, escala tipográfica, espaçamentos, raios, sombras e regras de UX mobile." Registrar a saída. Se a skill sugerir tons diferentes, ajustar os valores abaixo **mantendo** a identidade (creme/terracota/sálvia/marinho) e AA para texto branco sobre terracota (≥ 4.5:1) e marinho sobre creme.

- [ ] **Step 2: Criar `src/styles/tokens.css`** (valores de partida; substituir pelos refinados no Step 1):

```css
:root {
  /* Cores */
  --c-creme: #FBF6EE;
  --c-bege: #F3EADB;
  --c-bege-escuro: #E8DAC3;
  --c-terracota: #B4532F;          /* AA com branco: 5.0:1 */
  --c-terracota-escuro: #933F20;
  --c-salvia: #A9BA94;
  --c-salvia-claro: #DCE5D0;
  --c-oliva: #5E7132;
  --c-caramelo: #A87B4F;
  --c-marinho: #1F2D4A;
  --c-texto: #2B3550;
  --c-texto-suave: #55607A;
  --c-branco: #FFFFFF;

  /* Fontes */
  --f-titulo: "Outfit", system-ui, sans-serif;
  --f-corpo: "Nunito Sans", system-ui, sans-serif;
  --f-manuscrita: "Caveat", cursive;

  /* Escala tipográfica fluida (375px → 1440px) */
  --fs-xs: 0.8125rem;
  --fs-sm: 0.9375rem;
  --fs-base: 1rem;
  --fs-lg: clamp(1.125rem, 1.05rem + 0.3vw, 1.25rem);
  --fs-xl: clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem);
  --fs-2xl: clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem);
  --fs-3xl: clamp(2.375rem, 1.7rem + 3.2vw, 4.25rem);
  --lh-titulo: 1.08;
  --lh-corpo: 1.6;

  /* Espaços (base 4px) */
  --sp-1: 0.25rem; --sp-2: 0.5rem; --sp-3: 0.75rem; --sp-4: 1rem;
  --sp-5: 1.5rem; --sp-6: 2rem; --sp-7: 2.5rem; --sp-8: 3rem;
  --sp-9: 4rem; --sp-10: 6rem;

  /* Raios e sombras */
  --r-sm: 10px; --r-md: 16px; --r-lg: 24px; --r-pill: 999px;
  --sh-sm: 0 1px 2px rgb(74 52 30 / 0.08), 0 2px 6px rgb(74 52 30 / 0.06);
  --sh-md: 0 4px 12px rgb(74 52 30 / 0.08), 0 10px 24px rgb(74 52 30 / 0.06);
  --sh-lg: 0 12px 32px rgb(74 52 30 / 0.12);

  /* Layout e UX */
  --toque: 44px;
  --container: 1180px;
  --gutter: clamp(1rem, 4vw, 2rem);
  --header-h: 64px;
  --dur-rapida: 200ms;
  --ease-saida: cubic-bezier(0.22, 1, 0.36, 1);
}
```

- [ ] **Step 3: Criar `src/styles/base.css`:**

```css
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; scroll-padding-top: calc(var(--header-h) + 8px); }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
html.menu-aberto { overflow: hidden; }
body {
  margin: 0;
  background: var(--c-creme);
  color: var(--c-texto);
  font-family: var(--f-corpo);
  font-size: var(--fs-base);
  line-height: var(--lh-corpo);
  overflow-x: clip;
  -webkit-tap-highlight-color: transparent;
}
img, svg { display: block; max-width: 100%; }
img { height: auto; }
h1, h2, h3 { font-family: var(--f-titulo); color: var(--c-marinho); line-height: var(--lh-titulo); margin: 0; font-weight: 800; letter-spacing: -0.01em; }
p { margin: 0; }
a { color: inherit; }
button { font: inherit; color: inherit; }
:focus-visible { outline: 3px solid var(--c-terracota); outline-offset: 3px; border-radius: 4px; }

.container { width: min(100% - 2 * var(--gutter), var(--container)); margin-inline: auto; }
.secao { position: relative; padding-block: var(--sp-9); overflow-x: clip; }
.secao__titulo { font-size: var(--fs-2xl); }
.secao__sub { color: var(--c-texto-suave); font-size: var(--fs-lg); margin-top: var(--sp-2); }
.manuscrita { font-family: var(--f-manuscrita); font-weight: 600; color: var(--c-terracota); font-size: var(--fs-xl); line-height: 1.1; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.skip-link { position: absolute; left: var(--sp-4); top: -100px; background: var(--c-marinho); color: var(--c-branco); padding: var(--sp-3) var(--sp-4); border-radius: var(--r-sm); z-index: 100; }
.skip-link:focus { top: var(--sp-2); }
```

- [ ] **Step 4: Atualizar `src/main.js`** (temporário, cresce nas próximas tasks):

```js
import './styles/tokens.css'
import './styles/base.css'
```

- [ ] **Step 5: Atualizar o `<head>` de `index.html`** e remover o `<link rel="stylesheet" href="/src/style.css">`:

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Casa Árbora — Bolos naturais Baby Friendly e veganos no ABC</title>
<meta name="description" content="Bolos e doces sem açúcar refinado, Baby Friendly e veganos, feitos à mão sob encomenda no ABC Paulista. Peça pelo WhatsApp." />
<meta name="theme-color" content="#FBF6EE" />
<link rel="icon" type="image/png" href="/images/favicon.png" />
<meta property="og:title" content="Casa Árbora — Bolos de verdade, doces por natureza" />
<meta property="og:description" content="Bolos e doces Baby Friendly e veganos, feitos sob encomenda no ABC Paulista." />
<meta property="og:image" content="/images/cardapio/festa-cacau-tamaras.jpg" /><!-- TODO(conteúdo) P13: trocar por URL absoluta quando houver domínio -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&family=Outfit:wght@600;800&display=swap" rel="stylesheet" />
```

(Se o Step 1 trocar as fontes, ajustar a URL e `--f-*`.)

- [ ] **Step 6: Apagar `src/style.css`, rodar `npm run build`** — Expected: build sem erros.

- [ ] **Step 7: Commit**

```bash
git add -A index.html src .gitignore package.json package-lock.json
git commit -m "feat: design tokens and CSS foundation"
```

---

### Task 2: Preparo das imagens reais (script reprodutível)

**Files:**
- Create: `scripts/prepare_assets.py`, `assets-src/` (gitignored), `public/images/**`
- Modify: `.gitignore`

**Interfaces:**
- Produces (caminhos usados por tasks 4, 5, 6): `public/images/bolo-topo.png`, `public/images/logo.png`, `public/images/logo-claro.png`, `public/images/favicon.png`, `public/images/confeiteira.jpg`, `public/images/selos/{baby-friendly,sem-gluten,vegano}.png`, `public/images/deco/{frutas-folha,frutas}.jpg`, `public/images/cardapio/<id>.jpg` para cada `id` da seção 6 do spec (lista no script).

- [ ] **Step 1: Copiar as fontes para `assets-src/`** e ignorar a pasta:

```bash
mkdir -p assets-src/selos
cp "/c/Users/DELL/Downloads/CAKES_setembro2026.pdf" assets-src/setembro.pdf
cp "/c/Users/DELL/Downloads/Cardapio_gpt_26_fotos_tratadas.pdf" assets-src/tratadas.pdf
curl -sL "https://www.casaarbora.com/_files/ugd/2248d6_ea212277a19e491abf4fef62322187db.pdf" -o assets-src/antigo.pdf
IMG="/c/Users/DELL/AppData/Local/Temp/claude/c--Users-DELL-Documents-GitHub-Casa-Arbora/c647a154-2d72-4c7d-93c7-bd2636a8fee5/images"
cp "$IMG/2.jpg" assets-src/selos/vegano.jpg
cp "$IMG/3.jpg" assets-src/selos/sem-gluten.jpg
cp "$IMG/4.jpg" assets-src/selos/baby-friendly.jpg
echo "assets-src/" >> .gitignore
```

Expected: 3 PDFs e 3 JPGs em `assets-src/`. Se as imagens temporárias não existirem mais, pedir os selos ao usuário.

- [ ] **Step 2: Criar `scripts/prepare_assets.py`:**

```python
"""Extrai e prepara as imagens do site a partir dos PDFs em assets-src/.
Uso: python scripts/prepare_assets.py   (requer: pip install pymupdf pillow)
"""
import io
from pathlib import Path
import pymupdf
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
OUT = ROOT / "public" / "images"

def imagens_da_pagina(pdf, pagina):
    doc = pymupdf.open(SRC / pdf)
    return [Image.open(io.BytesIO(doc.extract_image(x[0])["image"])).convert("RGB")
            for x in doc[pagina].get_images(full=True)]

SET = imagens_da_pagina("setembro.pdf", 0)   # 22 imagens (índices = p01_N)
GPT = imagens_da_pagina("tratadas.pdf", 0)   # 19 imagens
ANT = imagens_da_pagina("antigo.pdf", 6)     # página "Veganos" do PDF antigo

def quadrada(img, lado=800):
    return ImageOps.fit(img, (lado, lado), Image.LANCZOS, centering=(0.5, 0.5))

def salvar_jpg(img, caminho, qualidade=80):
    caminho.parent.mkdir(parents=True, exist_ok=True)
    img.save(caminho, "JPEG", quality=qualidade, optimize=True, progressive=True)

def circulo(img, cx, cy, r, lado):
    """Recorta um círculo (cx, cy, r em px) com borda suave e fundo transparente."""
    box = (cx - r, cy - r, cx + r, cy + r)
    rec = img.crop(box).resize((lado, lado), Image.LANCZOS).convert("RGBA")
    k = 4
    mask = Image.new("L", (lado * k, lado * k), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, lado * k - 1, lado * k - 1), fill=255)
    rec.putalpha(mask.resize((lado, lado), Image.LANCZOS))
    return rec

def bbox_fora_do_fundo(img, limiar=40):
    """Caixa do conteúdo que difere da cor do canto superior esquerdo."""
    fundo = img.getpixel((2, 2))
    dif = Image.eval(img.convert("RGB"), lambda v: v)
    px = dif.load(); w, h = dif.size
    xs, ys = [], []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            p = px[x, y]
            if sum(abs(p[i] - fundo[i]) for i in range(3)) > limiar:
                xs.append(x); ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)

def selo(nome):
    img = Image.open(SRC / "selos" / f"{nome}.jpg").convert("RGB")
    x0, y0, x1, y1 = bbox_fora_do_fundo(img)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    r = max(x1 - x0, y1 - y0) // 2 - 2
    destino = OUT / "selos" / f"{nome}.png"
    destino.parent.mkdir(parents=True, exist_ok=True)
    circulo(img, cx, cy, r, 360).save(destino, optimize=True)

def logo(img, cor, destino, corte=None):
    """Line-art escuro sobre branco → PNG transparente na cor dada."""
    g = ImageOps.grayscale(img)
    if corte: g = g.crop(corte)
    alpha = ImageOps.invert(g).point(lambda v: 0 if v < 40 else min(255, int(v * 1.4)))
    bbox = alpha.getbbox(); alpha = alpha.crop(bbox)
    out = Image.new("RGBA", alpha.size, cor + (0,)); out.putalpha(alpha)
    out.thumbnail((600, 600), Image.LANCZOS)
    destino.parent.mkdir(parents=True, exist_ok=True); out.save(destino, optimize=True)

# ---- Fotos do cardápio: id -> imagem ----
CARDAPIO = {
    "classico-limao-mirtilos": GPT[9],
    "classico-banana-amoras": SET[21],
    "classico-banana-maca": SET[20],
    "classico-cacau-tamaras": SET[19],
    "classico-pera-amendoas": SET[3],
    "classico-maca-baunilha-nozes": SET[3],      # TODO(conteúdo) P1: foto própria
    "classico-cenoura-damasco-cacau": GPT[13],
    "classico-mandala-morango": GPT[0],
    "festa-limao-mirtilos": SET[5],
    "festa-cacau-tamaras": SET[6],
    "festa-damasco-banana": SET[7],
    "vegano-chocolatudo": SET[8],
    "vegano-laranja": ANT[3],                     # TODO(conteúdo) P5: baixa resolução
    "vegano-limao-siciliano": SET[10],
    "vegano-chocolate-banana": ANT[0],            # TODO(conteúdo) P5: baixa resolução
    "vegano-cenoura-tamara": SET[11],
    "vegano-baunilha": SET[9],
    "docinho-cacau-avela": SET[12],
    "docinho-beijinho": SET[14],
    "docinho-cajuzinho": SET[13],
    "muffin-banana": SET[17],                     # TODO(conteúdo) P2
    "muffin-cacau": SET[17],                      # TODO(conteúdo) P3
    "muffin-cenoura": SET[17],
    "granola": SET[15],
}

def kit(a, b):
    """Composição meio a meio (placeholder dos kits — P4)."""
    tela = Image.new("RGB", (800, 800))
    tela.paste(ImageOps.fit(a, (400, 800), Image.LANCZOS), (0, 0))
    tela.paste(ImageOps.fit(b, (400, 800), Image.LANCZOS), (400, 0))
    return tela

KITS = {
    "kit-primeira-festinha": kit(SET[5], SET[12]),
    "kit-escolinha": kit(SET[17], SET[14]),
    "kit-festa-baby-friendly": kit(SET[6], SET[13]),
}

def placeholder_confeiteira():
    """TODO(conteúdo) P7: placeholder ilustrado (não usar foto de terceiros como se fosse a Tânia)."""
    img = Image.new("RGB", (800, 1000), (243, 234, 219))
    d = ImageDraw.Draw(img)
    d.ellipse((250, 260, 550, 560), fill=(169, 186, 148))
    d.rounded_rectangle((180, 600, 620, 1000), radius=200, fill=(169, 186, 148))
    salvar_jpg(img, OUT / "confeiteira.jpg")

def main():
    for nome in ("baby-friendly", "sem-gluten", "vegano"):
        selo(nome)
    for id_, img in CARDAPIO.items():
        salvar_jpg(quadrada(img), OUT / "cardapio" / f"{id_}.jpg")
    for id_, img in KITS.items():
        salvar_jpg(img, OUT / "cardapio" / f"{id_}.jpg")
    # Bolo visto de cima (ajustar BOLO_* olhando a prévia gerada)
    b = SET[19]; w, h = b.size
    BOLO_CX, BOLO_CY, BOLO_R = int(w * 0.50), int(h * 0.50), int(min(w, h) * 0.46)
    circulo(b, BOLO_CX, BOLO_CY, BOLO_R, 900).save(OUT / "bolo-topo.png", optimize=True)
    # Logo real (TODO(conteúdo) P10: substituir por vetor oficial)
    logo(GPT[4], (31, 45, 74), OUT / "logo.png")
    logo(GPT[4], (251, 246, 238), OUT / "logo-claro.png")
    w, h = GPT[4].size
    logo(GPT[4], (31, 45, 74), OUT / "favicon.png", corte=(0, 0, w, int(h * 0.62)))
    Image.open(OUT / "favicon.png").resize((64, 64), Image.LANCZOS).save(OUT / "favicon.png")
    # Decorações
    salvar_jpg(quadrada(SET[18], 700), OUT / "deco" / "frutas-folha.jpg")
    salvar_jpg(quadrada(GPT[17], 700), OUT / "deco" / "frutas.jpg")
    placeholder_confeiteira()
    print("ok")

if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Rodar** `PYTHONIOENCODING=utf-8 python scripts/prepare_assets.py` — Expected: imprime `ok`; `public/images/cardapio/` tem 27 JPGs; `selos/` tem 3 PNGs.

- [ ] **Step 4: Conferir visualmente** com o Read tool: `bolo-topo.png` (círculo preenchido só com o bolo, sem caixa aparecendo nas bordas), os 3 selos (sem resto de fundo preto/creme fora do círculo), `logo.png`, e uma folha de contato dos 27 JPGs do cardápio (montar com Pillow em `$SCRATCHPAD`). Se o bolo mostrar borda da caixa, reduzir `BOLO_R` / ajustar `BOLO_CX/CY` e rodar de novo. Se algum item estiver com a foto errada, corrigir o índice em `CARDAPIO`.

- [ ] **Step 5: Commit**

```bash
git add scripts public/images .gitignore
git commit -m "feat: real photos, seals, logo and cake cutout from menu PDFs"
```

---

### Task 3: Configuração e links de WhatsApp

**Files:**
- Create: `src/config.js`, `src/js/whatsapp.js`, `vite.config.js`, `tests/whatsapp.test.js`
- Modify: `package.json` (devDeps + script `test`)

**Interfaces:**
- Produces:
  - `config` (default export de `src/config.js`): `{ brandName: string, whatsappNumber: string, instagramUser: string, instagramUrl: string, mensagens: { generica: string, item: ({categoria,item,rotulo,detalhe,preco}) => string, kit: (nomeKit) => string } }`
  - `buildWhatsAppUrl(texto: string, numero = config.whatsappNumber): string`
  - `initWhatsAppLinks(root: ParentNode = document): void` — para cada `[data-whatsapp]`, define `href` com `config.mensagens.generica` (ou o texto de `data-whatsapp-text` se houver), `target="_blank"`, `rel="noopener"`.

- [ ] **Step 1: Instalar Vitest + jsdom e configurar**

```bash
npm i -D vitest jsdom
```

Se houver conflito de peer com Vite 8, usar `npm i -D vitest@latest jsdom --legacy-peer-deps` e registrar no commit.

`package.json` → `"scripts"`: adicionar `"test": "vitest run"`.

`vite.config.js`:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  test: { environment: 'jsdom', include: ['tests/**/*.test.js'] },
})
```

- [ ] **Step 2: Escrever o teste `tests/whatsapp.test.js`:**

```js
import { describe, it, expect, beforeEach } from 'vitest'
import config from '../src/config.js'
import { buildWhatsAppUrl, initWhatsAppLinks } from '../src/js/whatsapp.js'

describe('buildWhatsAppUrl', () => {
  it('monta a URL wa.me com o número da config', () => {
    expect(buildWhatsAppUrl('Oi')).toBe('https://wa.me/5511942237434?text=Oi')
  })
  it('codifica &, acentos e quebras de linha', () => {
    const url = buildWhatsAppUrl('Cacau & Tâmaras\nData: ')
    expect(url).toBe('https://wa.me/5511942237434?text=Cacau%20%26%20T%C3%A2maras%0AData%3A%20')
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Cacau & Tâmaras\nData: ')
  })
})

describe('mensagens', () => {
  it('mensagem de item traz categoria, item, tamanho, detalhe e preço', () => {
    const msg = config.mensagens.item({ categoria: 'Clássicos', item: 'Cacau & Tâmaras', rotulo: 'Médio', detalhe: '12 a 14 fatias · 1,2 kg', preco: 'R$ 230' })
    expect(msg).toBe('Olá, Casa Árbora! Quero encomendar: Clássicos — Cacau & Tâmaras, Médio (12 a 14 fatias · 1,2 kg), R$ 230.\nData: \nConvidados: \nRestrições: ')
  })
  it('mensagem de kit pede valores', () => {
    expect(config.mensagens.kit('Kit Escolinha')).toBe('Olá, Casa Árbora! Quero saber os valores do Kit Escolinha.\nData: \nConvidados: \nRestrições: ')
  })
})

describe('initWhatsAppLinks', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a id="a" data-whatsapp href="https://wa.me/5511942237434">x</a>
      <a id="b" data-whatsapp data-whatsapp-text="Texto próprio">y</a>`
  })
  it('aplica href, target e rel', () => {
    initWhatsAppLinks()
    const a = document.getElementById('a')
    expect(a.href).toBe(buildWhatsAppUrl(config.mensagens.generica))
    expect(a.target).toBe('_blank')
    expect(a.rel).toBe('noopener')
    expect(document.getElementById('b').href).toBe(buildWhatsAppUrl('Texto próprio'))
  })
})
```

- [ ] **Step 3: Rodar** `npm test` — Expected: FAIL (módulos não existem).

- [ ] **Step 4: Criar `src/config.js`:**

```js
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
```

- [ ] **Step 5: Criar `src/js/whatsapp.js`:**

```js
import config from '../config.js'

export function buildWhatsAppUrl(texto, numero = config.whatsappNumber) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

export function initWhatsAppLinks(root = document) {
  root.querySelectorAll('[data-whatsapp]').forEach((el) => {
    const texto = el.dataset.whatsappText || config.mensagens.generica
    el.href = buildWhatsAppUrl(texto)
    el.target = '_blank'
    el.rel = 'noopener'
  })
}
```

- [ ] **Step 6: Rodar** `npm test` — Expected: PASS (5 testes).

- [ ] **Step 7: Commit**

```bash
git add src/config.js src/js/whatsapp.js tests vite.config.js package.json package-lock.json
git commit -m "feat: brand config and WhatsApp link builder with tests"
```

---

### Task 4: Dados e renderização do cardápio (abas + seletor de tamanho)

**Files:**
- Create: `src/data/cardapio.js`, `src/js/cardapio.js`, `tests/cardapio.test.js`

**Interfaces:**
- Consumes: `config`, `buildWhatsAppUrl` (Task 3).
- Produces:
  - `categorias` (export de `src/data/cardapio.js`): `Array<{ id, nome, subtitulo, nota, itens: Array<{ id, nome, tags: string[], descricao, foto, alt, opcoes: Array<{ rotulo, detalhe, preco: number|null }>, pendente?: string[], tipo?: 'kit' }> }>`
  - `TAGS`: `{ bf, vg, sg, sazonal, sc }` → `{ rotulo, selo?: string }`
  - `formatPreco(preco: number|null): string` → `'R$ 160'` (espaço normal) ou `'Sob consulta'`
  - `mensagemItem(categoria, item, opcao): string`
  - `renderCardapio(root: HTMLElement, categorias, { dev = false } = {}): void`
  - `initCardapio(root = document.querySelector('[data-cardapio]')): void`
  - Evento `cardapio:change` disparado em `document` ao trocar de aba (`detail: { id }`).

- [ ] **Step 1: Criar `src/data/cardapio.js`** (conteúdo exato do spec §6):

```js
// Cardápio — edite aqui nomes, descrições, tamanhos e preços.
// preco: null => "Sob consulta". pendente: lista do que falta (aparece só em `npm run dev`).
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
  id: `vegano-${id}`, nome, tags: ['vg'],
  descricao: `Bolo vegano de ${nome}, adoçado com açúcar demerara orgânico.`, // TODO(conteúdo) P6
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
      { id: 'classico-maca-baunilha-nozes', nome: 'Maçã, Baunilha & Nozes', tags: ['bf'],
        descricao: 'Massa de maçã e baunilha. Decorado com lascas de maçã e nozes picadas. Finalizado com leite de coco em pó e canela.',
        foto: img('classico-maca-baunilha-nozes'), alt: 'Bolo de maçã, baunilha e nozes', opcoes: [P_CLASSICO, M_CLASSICO],
        pendente: ['foto'] }, // TODO(conteúdo) P1
      { id: 'classico-cenoura-damasco-cacau', nome: 'Cenoura, Damasco & Cacau', tags: ['bf'],
        descricao: 'Massa de cenoura e damascos. Coberto com ganache de chocolate 50% Baby Friendly e finalizado com physalis.',
        foto: img('classico-cenoura-damasco-cacau'), alt: 'Bolo de cenoura e damasco com ganache de chocolate',
        opcoes: [{ rotulo: 'Pequeno', detalhe: '9 a 10 fatias · 900 g', preco: 180 }, { rotulo: 'Médio', detalhe: '12 a 14 fatias · 1,2 kg', preco: 290 }] },
      { id: 'classico-mandala-morango', nome: 'Mandala de Morango', tags: ['bf', 'sazonal'],
        descricao: 'Bolo de cacau 100%, tâmaras e frutas secas, coberto com ganache de chocolate 50% e decorado com morangos frescos.',
        foto: img('classico-mandala-morango'), alt: 'Bolo coberto com morangos em formato de mandala',
        opcoes: [{ rotulo: 'Pequeno', detalhe: '8 a 12 fatias · 850 g', preco: 190 }, { rotulo: 'Médio', detalhe: '15 a 17 fatias · 1,5 kg', preco: 280 }],
        pendente: ['confirmar-disponibilidade'] }, // TODO(conteúdo) P12
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
    nota: 'Sem ingredientes de origem animal. Adoçados com açúcar demerara orgânico. Sem corantes ou conservantes. Pequeno: 7 a 9 fatias, 800 g · Médio: 12 a 14 fatias, 1,2 kg.',
    itens: [
      vegano('chocolatudo', 'Chocolatudo'),
      vegano('laranja', 'Laranja', { pendente: ['descricao', 'foto-baixa-resolucao'] }),
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
      { id: 'muffin-banana', nome: 'Banana', tags: ['bf'], descricao: 'Massa de banana com recheio de pedacinhos de banana.',
        foto: img('muffin-banana'), alt: 'Muffins Baby Friendly', opcoes: [CAIXA_MUFFINS], pendente: ['foto'] }, // TODO(conteúdo) P2
      { id: 'muffin-cacau', nome: 'Cacau', tags: ['bf'], descricao: 'Massa de cacau com recheio de gotas de chocolate Baby Friendly.',
        foto: img('muffin-cacau'), alt: 'Muffins Baby Friendly', opcoes: [CAIXA_MUFFINS], pendente: ['foto'] }, // TODO(conteúdo) P3
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
        foto: img('kit-primeira-festinha'), alt: 'Bolo de festa e docinhos', opcoes: [SOB_CONSULTA], pendente: ['foto'] }, // TODO(conteúdo) P4
      { id: 'kit-escolinha', tipo: 'kit', nome: 'Kit Escolinha', tags: ['bf', 'sc'], descricao: '24 muffins + docinhos.',
        foto: img('kit-escolinha'), alt: 'Muffins e docinhos', opcoes: [SOB_CONSULTA], pendente: ['foto'] },
      { id: 'kit-festa-baby-friendly', tipo: 'kit', nome: 'Kit Festa Baby Friendly', tags: ['bf', 'sc'], descricao: 'Bolo de duas camadas + 30 docinhos.',
        foto: img('kit-festa-baby-friendly'), alt: 'Bolo de duas camadas e docinhos', opcoes: [SOB_CONSULTA], pendente: ['foto'] },
    ],
  },
]
```

- [ ] **Step 2: Escrever `tests/cardapio.test.js`:**

```js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { categorias } from '../src/data/cardapio.js'
import { formatPreco, mensagemItem, renderCardapio } from '../src/js/cardapio.js'
const decode = (href) => decodeURIComponent(href.split('text=')[1])

describe('formatPreco', () => {
  it('formata reais sem centavos com espaço normal', () => expect(formatPreco(160)).toBe('R$ 160'))
  it('null vira Sob consulta', () => expect(formatPreco(null)).toBe('Sob consulta'))
})

describe('dados', () => {
  it('tem as 7 categorias na ordem do spec', () => {
    expect(categorias.map((c) => c.id)).toEqual(['classicos', 'festa', 'veganos', 'docinhos', 'muffins', 'granola', 'kits'])
  })
  it('todo item tem foto, alt e ao menos uma opção', () => {
    for (const c of categorias) for (const i of c.itens) {
      expect(i.foto).toMatch(/^\/images\/cardapio\/.+\.jpg$/)
      expect(i.alt.length).toBeGreaterThan(3)
      expect(i.opcoes.length).toBeGreaterThan(0)
    }
  })
  it('nunca usa "baixo índice glicêmico"', () => {
    expect(JSON.stringify(categorias).toLowerCase()).not.toContain('índice glicêmico')
  })
})

describe('mensagemItem', () => {
  it('monta a mensagem com categoria, tamanho e preço', () => {
    const c = categorias[0]; const i = c.itens[3]
    expect(mensagemItem(c, i, i.opcoes[1])).toContain('Clássicos — Cacau & Tâmaras, Médio (12 a 14 fatias · 1,2 kg), R$ 230.')
  })
  it('kit usa a mensagem de consulta', () => {
    const c = categorias.at(-1); const i = c.itens[1]
    expect(mensagemItem(c, i, i.opcoes[0])).toContain('Quero saber os valores do Kit Escolinha.')
  })
})

describe('renderCardapio', () => {
  let root
  beforeEach(() => {
    document.body.innerHTML = '<div data-cardapio></div>'
    root = document.querySelector('[data-cardapio]')
    renderCardapio(root, categorias)
  })

  it('cria uma aba por categoria e só a primeira painel visível', () => {
    const tabs = root.querySelectorAll('[role="tab"]')
    expect(tabs).toHaveLength(7)
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    const panels = root.querySelectorAll('[role="tabpanel"]')
    expect([...panels].filter((p) => !p.hidden)).toHaveLength(1)
    expect(panels[0].querySelectorAll('.produto')).toHaveLength(8)
  })

  it('clicar numa aba troca o painel e dispara cardapio:change', () => {
    const spy = vi.fn(); document.addEventListener('cardapio:change', spy)
    root.querySelector('#tab-veganos').click()
    expect(root.querySelector('#panel-veganos').hidden).toBe(false)
    expect(root.querySelector('#panel-classicos').hidden).toBe(true)
    expect(root.querySelector('#tab-veganos').getAttribute('aria-selected')).toBe('true')
    expect(spy).toHaveBeenCalledOnce()
    expect(spy.mock.calls[0][0].detail).toEqual({ id: 'veganos' })
  })

  it('setas do teclado movem a aba e o foco', () => {
    const t0 = root.querySelector('#tab-classicos'); t0.focus()
    t0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement.id).toBe('tab-festa')
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(document.activeElement.id).toBe('tab-kits')
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.activeElement.id).toBe('tab-classicos')
  })

  it('trocar o tamanho atualiza preço e link do WhatsApp', () => {
    const card = root.querySelector('[data-item="classico-cacau-tamaras"]')
    const link = card.querySelector('[data-pedido]')
    expect(decode(link.href)).toContain('Pequeno (9 a 10 fatias · 900 g), R$ 160.')
    const medio = card.querySelector('input[value="1"]')
    medio.checked = true; medio.dispatchEvent(new Event('change', { bubbles: true }))
    expect(card.querySelector('.produto__preco').textContent).toBe('R$ 230')
    expect(decode(link.href)).toContain('Médio (12 a 14 fatias · 1,2 kg), R$ 230.')
    expect(link.href.startsWith('https://wa.me/5511942237434?text=')).toBe(true)
  })

  it('item de opção única não mostra seletor', () => {
    const card = root.querySelector('[data-item="docinho-beijinho"]')
    expect(card.querySelector('input[type="radio"]')).toBeNull()
    expect(card.querySelector('.produto__preco').textContent).toBe('R$ 90')
  })

  it('kit mostra Sob consulta e botão Consultar, sem NaN', () => {
    const card = root.querySelector('[data-item="kit-escolinha"]')
    expect(card.querySelector('.produto__preco').textContent).toBe('Sob consulta')
    expect(card.querySelector('[data-pedido]').textContent.trim()).toBe('Consultar')
    expect(root.innerHTML).not.toContain('NaN')
  })

  it('etiquetas de pendência só aparecem com dev: true', () => {
    expect(root.querySelector('.dev-pendente')).toBeNull()
    renderCardapio(root, categorias, { dev: true })
    expect(root.querySelector('[data-item="classico-maca-baunilha-nozes"] .dev-pendente').textContent).toBe('PENDENTE: foto')
  })

  it('imagens têm width/height e lazy', () => {
    const img = root.querySelector('.produto img')
    expect(img.getAttribute('width')).toBe('800')
    expect(img.getAttribute('height')).toBe('800')
    expect(img.getAttribute('loading')).toBe('lazy')
  })
})
```

- [ ] **Step 3: Rodar** `npm test` — Expected: FAIL (`src/js/cardapio.js` não existe).

- [ ] **Step 4: Criar `src/js/cardapio.js`:**

```js
import config from '../config.js'
import { buildWhatsAppUrl } from './whatsapp.js'
import { categorias as dadosPadrao, TAGS } from '../data/cardapio.js'

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function formatPreco(preco) {
  if (preco == null) return 'Sob consulta'
  return fmt.format(preco).replace(/\s/g, ' ')
}

export function mensagemItem(categoria, item, opcao) {
  if (item.tipo === 'kit') return config.mensagens.kit(item.nome)
  return config.mensagens.item({
    categoria: categoria.nome, item: item.nome,
    rotulo: opcao.rotulo, detalhe: opcao.detalhe, preco: formatPreco(opcao.preco),
  })
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function tagsHTML(tags) {
  return `<ul class="tags" aria-label="Características">${tags.map((t) => {
    const tag = TAGS[t]
    const selo = tag.selo ? `<img src="${tag.selo}" alt="" width="20" height="20">` : ''
    return `<li class="tag tag--${t}">${selo}${esc(tag.rotulo)}</li>`
  }).join('')}</ul>`
}

function opcoesHTML(item) {
  if (item.opcoes.length === 1) {
    const o = item.opcoes[0]
    if (o.preco == null) return ''
    return `<p class="opcao-unica"><strong>${esc(o.rotulo)}</strong>${o.detalhe ? ` · ${esc(o.detalhe)}` : ''}</p>`
  }
  return `<fieldset class="tamanhos"><legend class="sr-only">Escolha o tamanho de ${esc(item.nome)}</legend>${item.opcoes.map((o, idx) => `
    <label class="tamanho">
      <input type="radio" name="tam-${item.id}" value="${idx}" ${idx === 0 ? 'checked' : ''}>
      <span class="tamanho__rotulo">${esc(o.rotulo)}</span>
      <span class="tamanho__detalhe">${esc(o.detalhe)}</span>
      <span class="tamanho__preco">${formatPreco(o.preco)}</span>
    </label>`).join('')}</fieldset>`
}

function cardHTML(categoria, item, dev) {
  const o = item.opcoes[0]
  const pend = dev && item.pendente?.length
    ? `<span class="dev-pendente">PENDENTE: ${item.pendente.join(', ')}</span>` : ''
  return `
  <article class="produto" data-item="${item.id}">
    <div class="produto__foto">${pend}<img src="${item.foto}" alt="${esc(item.alt)}" width="800" height="800" loading="lazy" decoding="async"></div>
    <div class="produto__corpo">
      ${tagsHTML(item.tags)}
      <h3 class="produto__nome">${esc(item.nome)}</h3>
      <p class="produto__desc">${esc(item.descricao)}</p>
      ${opcoesHTML(item)}
      <div class="produto__rodape">
        <p class="produto__preco" aria-live="polite">${formatPreco(o.preco)}</p>
        <a class="btn btn--primario" data-pedido href="${buildWhatsAppUrl(mensagemItem(categoria, item, o))}" target="_blank" rel="noopener"
           aria-label="${item.tipo === 'kit' ? 'Consultar' : 'Encomendar'} ${esc(item.nome)} pelo WhatsApp">${item.tipo === 'kit' ? 'Consultar' : 'Encomendar'}</a>
      </div>
    </div>
  </article>`
}

export function renderCardapio(root, categorias = dadosPadrao, { dev = false } = {}) {
  root.innerHTML = `
    <div class="abas" role="tablist" aria-label="Categorias do cardápio">
      ${categorias.map((c, i) => `<button type="button" class="aba" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(c.nome)}</button>`).join('')}
    </div>
    ${categorias.map((c, i) => `
      <section class="painel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" ${i === 0 ? '' : 'hidden'}>
        <header class="painel__cabeca">
          <p class="painel__sub">${esc(c.subtitulo)}</p>
          <p class="painel__nota">${esc(c.nota)}</p>
        </header>
        <div class="grade-produtos">${c.itens.map((it) => cardHTML(c, it, dev)).join('')}</div>
      </section>`).join('')}`

  const tabs = [...root.querySelectorAll('[role="tab"]')]

  function selecionar(tab, focar = false) {
    tabs.forEach((t) => {
      const ativo = t === tab
      t.setAttribute('aria-selected', String(ativo))
      t.tabIndex = ativo ? 0 : -1
      root.querySelector(`#${t.getAttribute('aria-controls')}`).hidden = !ativo
    })
    if (focar) tab.focus()
    document.dispatchEvent(new CustomEvent('cardapio:change', { detail: { id: tab.id.replace('tab-', '') } }))
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { if (tab.getAttribute('aria-selected') !== 'true') selecionar(tab) })
    tab.addEventListener('keydown', (e) => {
      const alvo = { ArrowRight: tabs[(i + 1) % tabs.length], ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length], Home: tabs[0], End: tabs.at(-1) }[e.key]
      if (alvo) { e.preventDefault(); selecionar(alvo, true) }
    })
  })

  root.addEventListener('change', (e) => {
    if (e.target.type !== 'radio') return
    const card = e.target.closest('.produto')
    const cat = categorias.find((c) => c.itens.some((it) => it.id === card.dataset.item))
    const item = cat.itens.find((it) => it.id === card.dataset.item)
    const opcao = item.opcoes[Number(e.target.value)]
    card.querySelector('.produto__preco').textContent = formatPreco(opcao.preco)
    card.querySelector('[data-pedido]').href = buildWhatsAppUrl(mensagemItem(cat, item, opcao))
  })
}

export function initCardapio(root = document.querySelector('[data-cardapio]')) {
  if (!root) return
  renderCardapio(root, dadosPadrao, { dev: import.meta.env.DEV })
}
```

- [ ] **Step 5: Rodar** `npm test` — Expected: PASS em todos os testes de `cardapio.test.js` e `whatsapp.test.js`.

- [ ] **Step 6: Commit**

```bash
git add src/data src/js/cardapio.js tests/cardapio.test.js
git commit -m "feat: menu data and tabbed menu renderer with size selector"
```

---

### Task 5: Marcação das seções, menu mobile e estilos (mobile first)

**Files:**
- Modify: `index.html` (body inteiro), `src/main.js`
- Create: `src/js/menu.js`, `src/js/dev-pendentes.js`, `src/styles/components.css`, `src/styles/sections.css`, `tests/menu.test.js`

**Interfaces:**
- Consumes: `initWhatsAppLinks` (Task 3), `initCardapio` (Task 4), tokens (Task 1), imagens (Task 2).
- Produces:
  - `initMenu(root = document): void` — usa `[data-menu-toggle]` (button) e `#menu-principal` (nav). Fecha com Esc, clique em link, clique fora e ao passar de 1100px.
  - `initDevPendentes(root = document, dev = import.meta.env.DEV): void` — para cada `[data-pendente]`, adiciona `<span class="dev-pendente">PENDENTE: …</span>` como primeiro filho.
  - Hooks de DOM para Tasks 6–7: `.cake-layer > img.cake` dentro de `#inicio`; `[data-reveal]` em títulos/cards; `[data-parallax]` nas decorações; `#cardapio` com `[data-cardapio]`.

- [ ] **Step 1: Escrever `tests/menu.test.js`:**

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { initMenu } from '../src/js/menu.js'
import { initDevPendentes } from '../src/js/dev-pendentes.js'

beforeEach(() => {
  document.documentElement.className = ''
  document.body.innerHTML = `
    <header><button data-menu-toggle aria-expanded="false" aria-controls="menu-principal">Menu</button>
    <nav id="menu-principal"><a href="#cardapio">Cardápio</a></nav></header>
    <main id="fora">x</main>
    <p data-pendente="foto da Tânia">p</p>`
  initMenu()
})
const btn = () => document.querySelector('[data-menu-toggle]')
const aberto = () => btn().getAttribute('aria-expanded') === 'true'

describe('initMenu', () => {
  it('abre e fecha no botão e trava o scroll', () => {
    btn().click(); expect(aberto()).toBe(true)
    expect(document.documentElement.classList.contains('menu-aberto')).toBe(true)
    btn().click(); expect(aberto()).toBe(false)
    expect(document.documentElement.classList.contains('menu-aberto')).toBe(false)
  })
  it('fecha com Esc e devolve o foco ao botão', () => {
    btn().click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(aberto()).toBe(false); expect(document.activeElement).toBe(btn())
  })
  it('fecha ao clicar num link e ao clicar fora', () => {
    btn().click(); document.querySelector('nav a').click(); expect(aberto()).toBe(false)
    btn().click(); document.getElementById('fora').click(); expect(aberto()).toBe(false)
  })
  it('fecha quando a tela vira desktop', () => {
    btn().click()
    window.innerWidth = 1200; window.dispatchEvent(new Event('resize'))
    expect(aberto()).toBe(false)
    expect(document.documentElement.classList.contains('menu-aberto')).toBe(false)
  })
})

describe('initDevPendentes', () => {
  it('só marca em dev', () => {
    initDevPendentes(document, false); expect(document.querySelector('.dev-pendente')).toBeNull()
    initDevPendentes(document, true)
    expect(document.querySelector('.dev-pendente').textContent).toBe('PENDENTE: foto da Tânia')
  })
})
```

- [ ] **Step 2: Rodar** `npm test` — Expected: FAIL (módulos não existem).

- [ ] **Step 3: Criar `src/js/menu.js`:**

```js
const DESKTOP = 1100

export function initMenu(root = document) {
  const btn = root.querySelector('[data-menu-toggle]')
  const nav = root.querySelector('#menu-principal')
  if (!btn || !nav) return

  const setAberto = (aberto, devolverFoco = false) => {
    btn.setAttribute('aria-expanded', String(aberto))
    btn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu')
    nav.classList.toggle('is-aberto', aberto)
    document.documentElement.classList.toggle('menu-aberto', aberto)
    if (!aberto && devolverFoco) btn.focus()
  }
  const estaAberto = () => btn.getAttribute('aria-expanded') === 'true'

  btn.addEventListener('click', (e) => { e.stopPropagation(); setAberto(!estaAberto()) })
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setAberto(false) })
  document.addEventListener('click', (e) => {
    if (estaAberto() && !nav.contains(e.target) && !btn.contains(e.target)) setAberto(false)
  })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && estaAberto()) setAberto(false, true) })
  window.addEventListener('resize', () => { if (window.innerWidth >= DESKTOP && estaAberto()) setAberto(false) })
}
```

- [ ] **Step 4: Criar `src/js/dev-pendentes.js`:**

```js
// Marca no site, só em `npm run dev`, o conteúdo que ainda falta (ver README → Pendências).
export function initDevPendentes(root = document, dev = import.meta.env.DEV) {
  if (!dev) return
  root.querySelectorAll('[data-pendente]').forEach((el) => {
    if (el.querySelector(':scope > .dev-pendente')) return
    const tag = document.createElement('span')
    tag.className = 'dev-pendente'
    tag.textContent = `PENDENTE: ${el.dataset.pendente}`
    el.prepend(tag)
  })
}
```

- [ ] **Step 5: Rodar** `npm test` — Expected: PASS.

- [ ] **Step 6: Escrever o `<body>` de `index.html`:**

```html
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>

  <!-- Sprite de ícones -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="i-folha" viewBox="0 0 64 64"><path d="M8 56C8 28 28 8 56 8c0 28-20 48-48 48Z" fill="currentColor"/><path d="M10 54 46 18" stroke="#fff" stroke-opacity=".45" stroke-width="2.5" fill="none" stroke-linecap="round"/></symbol>
    <symbol id="i-sem-acucar" viewBox="0 0 32 32"><rect x="7" y="9" width="14" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M11 9v-2.5h6V9M5 27 27 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></symbol>
    <symbol id="i-natural" viewBox="0 0 32 32"><path d="M6 26C6 14 14 6 26 6c0 12-8 20-20 20Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M6 26 18 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
    <symbol id="i-mao" viewBox="0 0 32 32"><path d="M16 27s-10-6-10-13a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 7-10 13-10 13Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></symbol>
    <symbol id="i-instagram" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></symbol>
    <symbol id="i-whatsapp" viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8.8 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.4.7 1.5 1.9 2.8 2.4.2.1.4 0 .5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.4 0 .6-.3 1.3-.9 1.6-.6.3-1.4.4-2.6-.1-1.6-.6-3.2-2-4.1-3.5-.7-1.2-.9-2.3-.9-2.7 0-.5.2-1 .5-1.3Z" fill="currentColor"/></symbol>
    <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
    <symbol id="i-fechar" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
    <symbol id="i-seta" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>
    <symbol id="rasgado" viewBox="0 0 1200 24" preserveAspectRatio="none"><path d="M0 24V10l30 4 26-7 34 6 28-5 30 7 36-8 24 5 40-3 22 6 38-7 30 4 26-6 42 8 30-5 28 4 36-7 26 6 34-4 30 5 40-8 22 6 36-3 28 5 34-7 30 6 26-5 38 7 32-6 24 4 40-5 30 6 28-7 36 5 22 3 40-4 34 6 38-5 32 3V24Z" fill="currentColor"/></symbol>
  </svg>

  <header class="topo">
    <div class="container topo__linha">
      <a class="topo__logo" href="#inicio" aria-label="Casa Árbora — início">
        <img src="/images/logo.png" alt="Casa Árbora" width="132" height="44" data-pendente="logo em vetor (P10)">
      </a>
      <button class="topo__menu-btn" type="button" data-menu-toggle aria-expanded="false" aria-controls="menu-principal" aria-label="Abrir menu">
        <svg class="ico-abrir" width="26" height="26"><use href="#i-menu"/></svg>
        <svg class="ico-fechar" width="26" height="26"><use href="#i-fechar"/></svg>
      </button>
      <nav class="topo__nav" id="menu-principal" aria-label="Principal">
        <ul>
          <li><a href="#cardapio">Cardápio</a></li>
          <li><a href="#ingredientes">Ingredientes</a></li>
          <li><a href="#sobre">Sobre</a></li>
          <li><a href="#encomendar">Como encomendar</a></li>
        </ul>
        <a class="btn btn--primario" data-whatsapp href="https://wa.me/5511942237434">Encomendar</a>
      </nav>
    </div>
  </header>

  <main id="conteudo">
    <!-- 1. HERO -->
    <section class="hero" id="inicio">
      <div class="cake-layer" aria-hidden="true">
        <!-- Trocar a foto do bolo animado: public/images/bolo-topo.png (PNG quadrado, fundo transparente) -->
        <img class="cake" src="/images/bolo-topo.png" alt="" width="900" height="900" fetchpriority="high">
      </div>
      <svg class="deco deco--folha-1" data-parallax="-30" width="90" height="90" aria-hidden="true"><use href="#i-folha"/></svg>
      <svg class="deco deco--folha-2" data-parallax="40" width="60" height="60" aria-hidden="true"><use href="#i-folha"/></svg>
      <div class="container hero__conteudo">
        <p class="manuscrita hero__kicker">Feito à mão, sem açúcar refinado</p>
        <h1 class="hero__titulo">Bolos de verdade, doces por natureza</h1>
        <p class="hero__sub">Bolos e doces Baby Friendly e veganos, adoçados com frutas frescas e secas. Feitos sob encomenda no ABC Paulista.</p>
        <div class="hero__acoes">
          <a class="btn btn--primario btn--grande" href="#cardapio">Ver cardápio <svg width="20" height="20" aria-hidden="true"><use href="#i-seta"/></svg></a>
          <a class="btn btn--link" href="#encomendar">Fazer encomenda</a>
        </div>
        <ul class="selos-hero">
          <li><svg width="28" height="28" aria-hidden="true"><use href="#i-sem-acucar"/></svg>Sem açúcar refinado</li>
          <li><svg width="28" height="28" aria-hidden="true"><use href="#i-natural"/></svg>Ingredientes naturais</li>
          <li><svg width="28" height="28" aria-hidden="true"><use href="#i-mao"/></svg>Feito à mão</li>
        </ul>
      </div>
    </section>

    <!-- 2. COMO ESCOLHER -->
    <section class="secao faixa" id="como-escolher" aria-labelledby="t-escolher">
      <svg class="rasgado rasgado--topo" aria-hidden="true"><use href="#rasgado"/></svg>
      <div class="container">
        <h2 class="secao__titulo" id="t-escolher" data-reveal>Para todo mundo comer junto</h2>
        <ul class="selos-lista">
          <li class="selo-item" data-reveal>
            <img src="/images/selos/baby-friendly.png" alt="" width="96" height="96" loading="lazy">
            <div><h3>Baby Friendly</h3><p>A partir de 9 meses. Sem açúcar adicionado, sem adoçantes, sem polióis, sem glúten, sem leite, sem lactose, sem caseína e sem ingredientes de origem animal. Adoçado com frutas frescas e secas.</p></div>
          </li>
          <li class="selo-item" data-reveal>
            <img src="/images/selos/sem-gluten.png" alt="" width="96" height="96" loading="lazy">
            <div><h3>Sem glúten</h3><p>Toda a linha Baby Friendly e a granola artesanal.</p></div>
          </li>
          <li class="selo-item" data-reveal>
            <img src="/images/selos/vegano.png" alt="" width="96" height="96" loading="lazy">
            <div><h3>100% Vegano</h3><p>Sem ingredientes de origem animal. A linha vegana tradicional é adoçada com açúcar demerara orgânico.</p></div>
          </li>
        </ul>
        <p class="faixa__nota">Tem alergia, intolerância ou galactosemia? Conte antes de encomendar — avaliamos o preparo e o risco de contaminação cruzada. Galactosemia: somente sob anamnese prévia.</p>
      </div>
      <svg class="rasgado rasgado--base" aria-hidden="true"><use href="#rasgado"/></svg>
    </section>

    <!-- 3. CARDÁPIO (gerado a partir de src/data/cardapio.js) -->
    <section class="secao cardapio" id="cardapio" aria-labelledby="t-cardapio">
      <div class="container">
        <p class="manuscrita" data-reveal>Escolha o seu</p>
        <h2 class="secao__titulo" id="t-cardapio" data-reveal>Cardápio</h2>
        <p class="secao__sub" data-reveal>Toque numa categoria, escolha o tamanho e encomende pelo WhatsApp.</p>
        <div class="cardapio__app" data-cardapio>
          <noscript><p>Veja o cardápio completo pelo <a href="https://wa.me/5511942237434">WhatsApp</a>.</p></noscript>
        </div>
      </div>
    </section>

    <!-- 4. INGREDIENTES -->
    <section class="secao ingredientes" id="ingredientes" aria-labelledby="t-ingredientes">
      <svg class="rasgado rasgado--topo" aria-hidden="true"><use href="#rasgado"/></svg>
      <div class="container">
        <h2 class="secao__titulo" id="t-ingredientes" data-reveal>O que vai dentro</h2>
        <p class="secao__sub" data-reveal>Doçura de fruta, sabor de verdade.</p>
        <ul class="ingredientes__grade">
          <li data-reveal><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 40c10 10 32 8 42-14l-4-3c-6 14-22 20-36 12Z" fill="#F2C94C"/><path d="M50 23l4-5" stroke="#6B4E2E" stroke-width="3" stroke-linecap="round"/></svg>Banana</li>
          <li data-reveal><svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="32" rx="12" ry="20" fill="#7A4A2A" transform="rotate(25 32 32)"/><path d="M28 18c-3 6-3 16 2 26" stroke="#A86B43" stroke-width="3" fill="none" stroke-linecap="round"/></svg>Tâmara</li>
          <li data-reveal><svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="32" rx="14" ry="22" fill="#8B4A2B"/><path d="M32 10v44M24 13c-3 12-3 26 0 38M40 13c3 12 3 26 0 38" stroke="#6A3420" stroke-width="2.5" fill="none"/></svg>Cacau</li>
          <li data-reveal><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="22" cy="38" r="9" fill="#3B4A7A"/><circle cx="40" cy="40" r="9" fill="#2E3B66"/><path d="M32 30c-8-2-12-10-8-18 4 2 8 0 8 0s4 2 8 0c4 8 0 16-8 18Z" fill="#D9453B"/><path d="M28 12l4-4 4 4" stroke="#5E7132" stroke-width="3" fill="none" stroke-linecap="round"/></svg>Frutas vermelhas</li>
          <li data-reveal><svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="32" rx="22" ry="15" fill="#F4D35E"/><circle cx="32" cy="32" r="10" fill="#FBE9A6"/><path d="M32 22v20M22 32h20M25 25l14 14M39 25 25 39" stroke="#F4D35E" stroke-width="2"/></svg>Limão siciliano</li>
          <li data-reveal><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="20" fill="#7B5434"/><circle cx="32" cy="32" r="14" fill="#FFF8EC"/></svg>Coco</li>
          <li data-reveal><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 44c-6-10 0-24 12-26 8 12 2 26-12 26Z" fill="#C58B52"/><path d="M36 48c-4-12 4-24 16-24 4 14-4 24-16 24Z" fill="#A86B3C"/></svg>Castanhas</li>
          <li data-reveal><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 22c-10-6-22 0-20 14 2 12 10 20 20 16 10 4 18-4 20-16 2-14-10-20-20-14Z" fill="#D9453B"/><path d="M32 22c0-6 2-10 6-12" stroke="#6B4E2E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M36 14c6-4 12-2 12-2s-4 8-12 6Z" fill="#5E7132"/></svg>Maçã</li>
        </ul>
      </div>
    </section>

    <!-- 5. SOBRE -->
    <section class="secao sobre" id="sobre" aria-labelledby="t-sobre">
      <svg class="deco deco--folha-3" data-parallax="-25" width="80" height="80" aria-hidden="true"><use href="#i-folha"/></svg>
      <div class="container sobre__grade">
        <figure class="sobre__foto" data-reveal data-pendente="foto da Tânia (P7)">
          <!-- TODO(conteúdo) P7: trocar public/images/confeiteira.jpg pela foto da Tânia (retrato 4:5) -->
          <img src="/images/confeiteira.jpg" alt="Tânia, confeiteira da Casa Árbora" width="800" height="1000" loading="lazy">
        </figure>
        <div class="sobre__texto">
          <p class="manuscrita" data-reveal>Prazer!</p>
          <h2 class="secao__titulo" id="t-sobre" data-reveal>Oi, eu sou a Tânia</h2>
          <!-- TODO(conteúdo) P8: substituir pela história real da Tânia (2 a 4 frases) -->
          <p data-reveal data-pendente="história da Tânia (P8)">Comecei a fazer bolos sem açúcar para que crianças, pessoas com restrições e quem busca uma alimentação mais leve pudessem comer junto, sem abrir mão do sabor. Cada bolo é feito à mão, sob encomenda, com frutas, castanhas e ingredientes que eu escolho com carinho.</p>
          <p class="manuscrita sobre__assinatura" data-reveal>Conte comigo! — Tânia</p>
        </div>
      </div>
    </section>

    <!-- 6. DEPOIMENTOS -->
    <section class="secao depoimentos" id="depoimentos" aria-labelledby="t-depoimentos">
      <div class="container">
        <h2 class="secao__titulo" id="t-depoimentos" data-reveal>Quem provou, conta</h2>
        <!-- TODO(conteúdo) P9: TROCAR pelos depoimentos reais (com autorização) -->
        <ul class="depoimentos__lista" data-pendente="depoimentos reais (P9)">
          <li class="depoimento" data-reveal><blockquote><p>“O bolo do primeiro aniversário da minha filha foi o sucesso da festa. Os adultos repetiram!”</p></blockquote><p class="depoimento__autor">Mariana · Santo André</p></li>
          <li class="depoimento" data-reveal><blockquote><p>“Sou diabético e finalmente achei um bolo que eu como sem culpa e que é gostoso de verdade.”</p></blockquote><p class="depoimento__autor">Roberto · São Bernardo do Campo</p></li>
          <li class="depoimento" data-reveal><blockquote><p>“Os muffins viraram o lanche da escola aqui em casa. Congelo e vou usando na semana.”</p></blockquote><p class="depoimento__autor">Juliana · São Caetano do Sul</p></li>
        </ul>
      </div>
    </section>

    <!-- 7. COMO ENCOMENDAR -->
    <section class="secao encomendar" id="encomendar" aria-labelledby="t-encomendar">
      <svg class="rasgado rasgado--topo" aria-hidden="true"><use href="#rasgado"/></svg>
      <div class="container encomendar__grade">
        <div>
          <h2 class="secao__titulo" id="t-encomendar" data-reveal>Como encomendar</h2>
          <ol class="passos">
            <li data-reveal><span class="passos__num">1</span><div><h3>Escolha no cardápio</h3><p>Sabor e tamanho — ou um kit para festa e escola.</p></div></li>
            <li data-reveal><span class="passos__num">2</span><div><h3>Mande no WhatsApp</h3><p>Data, número de convidados, restrições alimentares e sabor. Peça com pelo menos 5 dias de antecedência.</p></div></li>
            <li data-reveal><span class="passos__num">3</span><div><h3>Confirme com o pagamento</h3><p>O pagamento antecipado confirma a encomenda (Pix ou link de cartão).</p></div></li>
            <li data-reveal><span class="passos__num">4</span><div><h3>Entrega ou retirada</h3><p>A combinar no ABC Paulista. Consulte as condições de frete.</p></div></li>
          </ol>
          <a class="btn btn--primario btn--grande btn--bloco" data-whatsapp href="https://wa.me/5511942237434" data-reveal>
            <svg width="22" height="22" aria-hidden="true"><use href="#i-whatsapp"/></svg> Pedir pelo WhatsApp
          </a>
          <p class="encomendar__marque">Ao postar, marque <a href="https://www.instagram.com/casaarbora/" target="_blank" rel="noopener">@casaarbora</a> 💛</p>
        </div>
        <img class="encomendar__foto" src="/images/deco/frutas-folha.jpg" alt="" width="700" height="700" loading="lazy" data-parallax="-20">
      </div>
    </section>
  </main>

  <!-- 8. RODAPÉ -->
  <footer class="rodape">
    <svg class="rasgado rasgado--topo" aria-hidden="true"><use href="#rasgado"/></svg>
    <div class="container rodape__conteudo">
      <img src="/images/logo-claro.png" alt="Casa Árbora" width="140" height="48" loading="lazy">
      <p class="manuscrita rodape__frase">Feito com muito carinho</p>
      <ul class="rodape__social">
        <li><a href="https://www.instagram.com/casaarbora/" target="_blank" rel="noopener" aria-label="Instagram @casaarbora"><svg width="24" height="24" aria-hidden="true"><use href="#i-instagram"/></svg></a></li>
        <li><a data-whatsapp href="https://wa.me/5511942237434" aria-label="WhatsApp (11) 94223-7434"><svg width="24" height="24" aria-hidden="true"><use href="#i-whatsapp"/></svg></a></li>
      </ul>
      <p>WhatsApp (11) 94223-7434 · ABC Paulista - SP</p>
      <p class="rodape__copy">© <span data-ano>2026</span> Casa Árbora</p>
    </div>
  </footer>

  <script type="module" src="/src/main.js"></script>
</body>
```

- [ ] **Step 7: Criar `src/styles/components.css`:**

```css
/* Botões */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--sp-2); min-height: var(--toque); padding: 0 var(--sp-5); border-radius: var(--r-pill); border: 0; font-family: var(--f-titulo); font-weight: 600; font-size: var(--fs-base); text-decoration: none; cursor: pointer; transition: background-color var(--dur-rapida) var(--ease-saida), transform var(--dur-rapida) var(--ease-saida); }
.btn:active { transform: scale(0.97); }
.btn--primario { background: var(--c-terracota); color: var(--c-branco); box-shadow: var(--sh-sm); }
@media (hover: hover) { .btn--primario:hover { background: var(--c-terracota-escuro); } }
.btn--grande { min-height: 52px; padding: 0 var(--sp-6); font-size: var(--fs-lg); }
.btn--bloco { width: 100%; }
.btn--link { background: none; color: var(--c-marinho); text-decoration: underline; text-underline-offset: 4px; padding: 0 var(--sp-3); }

/* Papel rasgado: svg posicionado na borda da seção, na cor da própria seção */
.rasgado { position: absolute; left: 0; width: 100%; height: 18px; pointer-events: none; }
.rasgado--topo { bottom: calc(100% - 1px); }
.rasgado--base { top: calc(100% - 1px); transform: rotate(180deg); }

/* Decorações */
.deco { position: absolute; color: var(--c-salvia); opacity: 0.9; pointer-events: none; z-index: 0; }

/* Tags e selos */
.tags { display: flex; flex-wrap: wrap; gap: var(--sp-2); list-style: none; margin: 0 0 var(--sp-2); padding: 0; }
.tag { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px 2px 4px; border-radius: var(--r-pill); background: var(--c-salvia-claro); color: var(--c-oliva); font-size: var(--fs-xs); font-weight: 700; }
.tag img { width: 20px; height: 20px; }
.tag--sazonal, .tag--sc { background: #F6E3D8; color: var(--c-terracota-escuro); padding-left: 10px; }

/* Abas do cardápio */
.abas { display: flex; flex-wrap: wrap; gap: var(--sp-2); margin: var(--sp-5) 0 var(--sp-4); }
.aba { min-height: var(--toque); padding: 0 var(--sp-4); border-radius: var(--r-pill); border: 1.5px solid var(--c-bege-escuro); background: var(--c-branco); color: var(--c-marinho); font-family: var(--f-titulo); font-weight: 600; cursor: pointer; position: relative; z-index: 1; }
.aba[aria-selected="true"] { background: var(--c-marinho); border-color: var(--c-marinho); color: var(--c-branco); }
.painel__cabeca { position: relative; z-index: 1; background: var(--c-bege); border-radius: var(--r-md); padding: var(--sp-3) var(--sp-4); margin-bottom: var(--sp-4); }
.painel__sub { font-family: var(--f-titulo); font-weight: 600; color: var(--c-marinho); }
.painel__nota { font-size: var(--fs-sm); color: var(--c-texto-suave); }

/* Card de produto */
.grade-produtos { display: grid; gap: var(--sp-5); }
.produto { position: relative; z-index: 1; display: flex; flex-direction: column; background: var(--c-branco); border-radius: var(--r-lg); box-shadow: var(--sh-md); overflow: hidden; }
.produto__foto { position: relative; aspect-ratio: 4 / 3; background: var(--c-bege); }
.produto__foto img { width: 100%; height: 100%; object-fit: cover; }
.produto__corpo { display: flex; flex-direction: column; gap: var(--sp-2); padding: var(--sp-4) var(--sp-4) var(--sp-5); flex: 1; }
.produto__nome { font-size: var(--fs-xl); }
.produto__desc { color: var(--c-texto-suave); font-size: var(--fs-sm); }
.tamanhos { border: 0; margin: var(--sp-2) 0 0; padding: 0; display: grid; gap: var(--sp-2); }
.tamanho { display: grid; grid-template-columns: auto 1fr auto; align-items: center; column-gap: var(--sp-3); min-height: var(--toque); padding: var(--sp-2) var(--sp-3); border: 1.5px solid var(--c-bege-escuro); border-radius: var(--r-md); cursor: pointer; }
.tamanho input { accent-color: var(--c-terracota); width: 20px; height: 20px; margin: 0; grid-row: span 2; }
.tamanho__rotulo { font-weight: 700; color: var(--c-marinho); }
.tamanho__detalhe { grid-column: 2; font-size: var(--fs-xs); color: var(--c-texto-suave); }
.tamanho__preco { grid-column: 3; grid-row: 1 / span 2; font-weight: 700; color: var(--c-marinho); }
.tamanho:has(input:checked) { border-color: var(--c-terracota); background: #FCF1EB; }
.tamanho:has(input:focus-visible) { outline: 3px solid var(--c-terracota); outline-offset: 2px; }
.opcao-unica { font-size: var(--fs-sm); color: var(--c-texto-suave); }
.produto__rodape { margin-top: auto; padding-top: var(--sp-3); display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3); }
.produto__preco { font-family: var(--f-titulo); font-weight: 800; font-size: var(--fs-xl); color: var(--c-marinho); }

/* Pendências (só em dev) */
.dev-pendente { position: absolute; top: 8px; left: 8px; z-index: 5; padding: 2px 8px; border: 2px dashed #D12; border-radius: 6px; background: #FFF4F4; color: #B00; font: 700 12px/1.4 system-ui, sans-serif; }
[data-pendente] { position: relative; }
```

- [ ] **Step 8: Criar `src/styles/sections.css`** (mobile first):

```css
/* Header */
.topo { position: sticky; top: 0; z-index: 50; background: rgb(251 246 238 / 0.94); backdrop-filter: blur(8px); border-bottom: 1px solid var(--c-bege); }
.topo__linha { display: flex; align-items: center; justify-content: space-between; height: var(--header-h); }
.topo__logo img { height: 40px; width: auto; }
.topo__menu-btn { display: inline-grid; place-items: center; width: var(--toque); height: var(--toque); border: 0; background: none; border-radius: var(--r-sm); color: var(--c-marinho); cursor: pointer; }
.topo__menu-btn .ico-fechar, .topo__menu-btn[aria-expanded="true"] .ico-abrir { display: none; }
.topo__menu-btn[aria-expanded="true"] .ico-fechar { display: block; }
.topo__nav { position: fixed; inset: var(--header-h) 0 auto 0; background: var(--c-creme); padding: var(--sp-4) var(--gutter) var(--sp-6); box-shadow: var(--sh-lg); display: grid; gap: var(--sp-4); visibility: hidden; opacity: 0; transform: translateY(-8px); transition: opacity var(--dur-rapida) var(--ease-saida), transform var(--dur-rapida) var(--ease-saida), visibility 0s linear var(--dur-rapida); }
.topo__nav.is-aberto { visibility: visible; opacity: 1; transform: none; transition-delay: 0s; }
.topo__nav ul { list-style: none; margin: 0; padding: 0; }
.topo__nav ul a { display: flex; align-items: center; min-height: 52px; font-family: var(--f-titulo); font-size: var(--fs-lg); font-weight: 600; color: var(--c-marinho); text-decoration: none; border-bottom: 1px solid var(--c-bege); }

/* Hero */
.hero { position: relative; min-height: calc(100svh - var(--header-h)); padding-top: var(--sp-6); padding-bottom: 62vw; overflow-x: clip; }
.hero__conteudo { position: relative; z-index: 2; }
.hero__kicker { margin-bottom: var(--sp-2); }
.hero__titulo { font-size: var(--fs-3xl); max-width: 12ch; }
.hero__sub { margin-top: var(--sp-4); font-size: var(--fs-lg); max-width: 34ch; }
.hero__acoes { display: flex; flex-wrap: wrap; align-items: center; gap: var(--sp-3); margin-top: var(--sp-5); }
.selos-hero { list-style: none; padding: 0; margin: var(--sp-6) 0 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-3); }
.selos-hero li { display: grid; justify-items: start; gap: var(--sp-1); font-size: var(--fs-xs); font-weight: 700; color: var(--c-marinho); line-height: 1.25; }
.selos-hero svg { color: var(--c-oliva); }
.deco--folha-1 { top: 8%; right: -22px; transform: rotate(40deg); }
.deco--folha-2 { top: 46%; left: -18px; transform: rotate(-120deg); }

/* Bolo: estático por padrão (sem JS / reduced motion), fixo quando animado */
.cake-layer { position: absolute; z-index: 0; pointer-events: none; right: -18vw; bottom: -6vw; width: 84vw; aspect-ratio: 1; }
.cake-layer.is-fixed { position: fixed; bottom: -14vw; }
.cake { width: 100%; height: 100%; filter: drop-shadow(0 18px 30px rgb(74 52 30 / 0.25)); }
.cake-layer.is-fixed .cake { will-change: transform, opacity; }

/* Como escolher (faixa sálvia opaca, acima do bolo) */
.faixa { z-index: 1; background: var(--c-salvia-claro); color: var(--c-texto); margin-block: 18px; }
.faixa .rasgado { color: var(--c-salvia-claro); }
.selos-lista { list-style: none; margin: var(--sp-5) 0 0; padding: 0; display: grid; gap: var(--sp-4); }
.selo-item { display: grid; grid-template-columns: 72px 1fr; gap: var(--sp-4); align-items: start; background: var(--c-creme); border-radius: var(--r-lg); padding: var(--sp-4); box-shadow: var(--sh-sm); }
.selo-item img { width: 72px; height: 72px; }
.selo-item h3 { font-size: var(--fs-lg); margin-bottom: var(--sp-1); }
.selo-item p { font-size: var(--fs-sm); }
.faixa__nota { margin-top: var(--sp-5); font-size: var(--fs-sm); color: var(--c-texto-suave); }

/* Cardápio (fundo transparente: o bolo passa por trás dos cards) */
.cardapio { z-index: auto; }
.cardapio .container > * { position: relative; z-index: 1; }

/* Ingredientes */
.ingredientes { z-index: 1; background: var(--c-bege); margin-top: 18px; }
.ingredientes .rasgado { color: var(--c-bege); }
.ingredientes__grade { list-style: none; margin: var(--sp-5) 0 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-5) var(--sp-2); text-align: center; }
.ingredientes__grade li { display: grid; justify-items: center; gap: var(--sp-2); font-size: var(--fs-xs); font-weight: 700; color: var(--c-marinho); }
.ingredientes__grade svg { width: 56px; height: 56px; }

/* Sobre */
.sobre { z-index: 1; background: var(--c-creme); }
.sobre__grade { display: grid; gap: var(--sp-6); }
.sobre__foto { margin: 0; border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--sh-md); max-width: 420px; }
.sobre__foto img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }
.sobre__texto p:not(.manuscrita) { margin-top: var(--sp-4); font-size: var(--fs-lg); }
.sobre__assinatura { margin-top: var(--sp-4); }
.deco--folha-3 { top: 20px; right: -16px; transform: rotate(160deg); }

/* Depoimentos */
.depoimentos { z-index: 1; background: var(--c-creme); }
.depoimentos__lista { list-style: none; margin: var(--sp-5) 0 0; padding: 0; display: grid; gap: var(--sp-4); }
.depoimento { background: var(--c-branco); border-radius: var(--r-lg); padding: var(--sp-5); box-shadow: var(--sh-sm); }
.depoimento blockquote { margin: 0; font-size: var(--fs-lg); color: var(--c-marinho); }
.depoimento__autor { margin-top: var(--sp-3); font-size: var(--fs-sm); font-weight: 700; color: var(--c-texto-suave); }

/* Como encomendar */
.encomendar { z-index: 1; background: var(--c-bege); margin-top: 18px; }
.encomendar .rasgado { color: var(--c-bege); }
.encomendar__grade { display: grid; gap: var(--sp-6); }
.passos { list-style: none; margin: var(--sp-5) 0 var(--sp-6); padding: 0; display: grid; gap: var(--sp-4); }
.passos li { display: grid; grid-template-columns: 44px 1fr; gap: var(--sp-3); }
.passos__num { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--c-terracota); color: var(--c-branco); font-family: var(--f-titulo); font-weight: 800; }
.passos h3 { font-size: var(--fs-lg); }
.passos p { font-size: var(--fs-sm); color: var(--c-texto-suave); }
.encomendar__marque { margin-top: var(--sp-3); text-align: center; font-size: var(--fs-sm); }
.encomendar__foto { width: min(80%, 360px); margin-inline: auto; border-radius: 50%; box-shadow: var(--sh-lg); }

/* Rodapé */
.rodape { position: relative; z-index: 1; background: var(--c-marinho); color: var(--c-creme); padding: var(--sp-8) 0 var(--sp-6); margin-top: 18px; text-align: center; }
.rodape .rasgado { color: var(--c-marinho); }
.rodape__conteudo { display: grid; justify-items: center; gap: var(--sp-3); }
.rodape__conteudo > img { height: 48px; width: auto; }
.rodape__frase { color: #F4C9B3; font-size: var(--fs-2xl); }
.rodape__social { list-style: none; margin: 0; padding: 0; display: flex; gap: var(--sp-3); }
.rodape__social a { display: grid; place-items: center; width: var(--toque); height: var(--toque); border-radius: 50%; border: 1.5px solid rgb(251 246 238 / 0.4); color: var(--c-creme); }
.rodape__copy { font-size: var(--fs-xs); opacity: 0.75; }

/* ---------- Tablet ---------- */
@media (min-width: 768px) {
  .hero { padding-bottom: 46vw; }
  .cake-layer { width: 60vw; right: -8vw; bottom: -4vw; }
  .cake-layer.is-fixed { bottom: -10vw; }
  .selos-lista { grid-template-columns: repeat(3, 1fr); }
  .selo-item { grid-template-columns: 1fr; justify-items: center; text-align: center; }
  .selo-item img { width: 96px; height: 96px; }
  .grade-produtos { grid-template-columns: repeat(2, 1fr); }
  .sobre__grade { grid-template-columns: 0.9fr 1.1fr; align-items: center; }
  .depoimentos__lista { grid-template-columns: repeat(3, 1fr); }
  .encomendar__grade { grid-template-columns: 1.2fr 0.8fr; align-items: center; }
  .btn--bloco { width: auto; }
}

/* ---------- Desktop ---------- */
@media (min-width: 1100px) {
  .topo__menu-btn { display: none; }
  .topo__nav { position: static; display: flex; align-items: center; gap: var(--sp-6); padding: 0; background: none; box-shadow: none; visibility: visible; opacity: 1; transform: none; }
  .topo__nav ul { display: flex; gap: var(--sp-5); }
  .topo__nav ul a { min-height: var(--toque); border: 0; font-size: var(--fs-base); }
  @media (hover: hover) { .topo__nav ul a:hover { color: var(--c-terracota); } }
  .hero { display: flex; align-items: center; padding-bottom: var(--sp-9); min-height: min(calc(100svh - var(--header-h)), 820px); }
  .hero__conteudo { width: min(100% - 2 * var(--gutter), var(--container)); }
  .hero__titulo, .hero__sub, .selos-hero { max-width: 560px; }
  .cake-layer, .cake-layer.is-fixed { width: min(46vw, 640px); right: max(2vw, calc((100vw - var(--container)) / 2 - 40px)); top: calc(var(--header-h) + 4vh); bottom: auto; }
  .grade-produtos { grid-template-columns: repeat(3, 1fr); }
  .ingredientes__grade { grid-template-columns: repeat(8, 1fr); }
}
```

- [ ] **Step 9: Atualizar `src/main.js`:**

```js
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/sections.css'
import { initMenu } from './js/menu.js'
import { initWhatsAppLinks } from './js/whatsapp.js'
import { initCardapio } from './js/cardapio.js'
import { initDevPendentes } from './js/dev-pendentes.js'

initMenu()
initCardapio()
initWhatsAppLinks()
initDevPendentes()
document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear() })
```

- [ ] **Step 10: Rodar** `npm test && npm run build` — Expected: testes PASS, build OK.

- [ ] **Step 11: Conferência rápida com Playwright MCP:** `npm run dev` em background; `browser_resize` 390×844; `browser_navigate` http://localhost:5173; `browser_take_screenshot` fullPage. Conferir: header com logo, hero legível, bolo na metade de baixo atrás do conteúdo, faixa sálvia com bordas rasgadas, abas e cards, rodapé marinho. `browser_evaluate`: `document.documentElement.scrollWidth <= innerWidth` → `true`. Corrigir o que estiver quebrado antes do commit.

- [ ] **Step 12: Commit**

```bash
git add index.html src tests
git commit -m "feat: page sections, mobile menu, components and mobile-first layout"
```

---

### Task 6: Animação principal — bolo no scroll

**Files:**
- Create: `src/js/cake-scroll.js`, `tests/cake-scroll.test.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `.cake-layer > .cake` (Task 5), `#cardapio`, evento `cardapio:change` (Task 4).
- Produces: `initCakeScroll({ layer?, endTrigger? } = {}): { mm: gsap.MatchMedia } | undefined`. Com movimento: adiciona `.is-fixed` ao layer e cria 1 ScrollTrigger (scrub). Com reduced motion: não adiciona classe, nenhuma timeline. Expõe `window.__cakeST` em dev para os testes de Playwright.

- [ ] **Step 1: Escrever `tests/cake-scroll.test.js`** (jsdom não faz layout; testa só a ramificação de movimento):

```js
import { describe, it, expect, beforeEach, vi } from 'vitest'

function mockMatchMedia(reduce) {
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: q.includes('no-preference') ? !reduce : q.includes(': reduce') ? reduce : false,
    media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }))
}

beforeEach(() => {
  vi.resetModules()
  document.body.innerHTML = '<section id="inicio"><div class="cake-layer"><img class="cake"></div></section><section id="cardapio"></section>'
})

describe('initCakeScroll', () => {
  it('com movimento: fixa o bolo', async () => {
    mockMatchMedia(false)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    initCakeScroll()
    expect(document.querySelector('.cake-layer').classList.contains('is-fixed')).toBe(true)
  })
  it('com reduced motion: bolo estático, sem fixed', async () => {
    mockMatchMedia(true)
    const { initCakeScroll } = await import('../src/js/cake-scroll.js')
    initCakeScroll()
    expect(document.querySelector('.cake-layer').classList.contains('is-fixed')).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar** `npm test` — Expected: FAIL (módulo não existe).

- [ ] **Step 3: Criar `src/js/cake-scroll.js`:**

```js
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Bolo do hero: gira, encolhe e some até o fim do #cardapio (scrub = acompanha o scroll nos dois sentidos).
export function initCakeScroll({ layer = document.querySelector('.cake-layer'), endTrigger = '#cardapio' } = {}) {
  const cake = layer?.querySelector('.cake')
  if (!cake || !document.querySelector(endTrigger)) return

  const mm = gsap.matchMedia()
  mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1100px)' },
    ({ conditions }) => {
      if (!conditions.motion) return
      layer.classList.add('is-fixed')
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          endTrigger,
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      tl.to(cake, {
        rotation: 540,
        scale: 0,
        xPercent: conditions.desktop ? 25 : 10,
        yPercent: conditions.desktop ? -10 : -70,
        duration: 1,
      }, 0)
      tl.to(cake, { opacity: 0, duration: 0.35 }, 0.65)
      if (import.meta.env.DEV) window.__cakeST = tl.scrollTrigger
      return () => {
        layer.classList.remove('is-fixed')
        gsap.set(cake, { clearProps: 'all' })
      }
    },
  )

  const refresh = () => ScrollTrigger.refresh()
  window.addEventListener('load', refresh, { once: true })
  document.addEventListener('cardapio:change', refresh)
  return { mm }
}
```

- [ ] **Step 4: Rodar** `npm test` — Expected: PASS.

- [ ] **Step 5: Chamar em `src/main.js`** — adicionar `import { initCakeScroll } from './js/cake-scroll.js'` e `initCakeScroll()` **depois** de `initCardapio()` (o cardápio precisa existir para medir o fim).

- [ ] **Step 6: Validar com Playwright MCP** (390×844 e 1440×900), servidor `npm run dev`:
  1. `browser_evaluate`:
     ```js
     async () => {
       const st = window.__cakeST, cake = document.querySelector('.cake'), out = []
       for (const p of [0, 0.25, 0.5, 0.75, 1]) {
         window.scrollTo(0, st.start + (st.end - st.start) * p)
         await new Promise((r) => setTimeout(r, 900))
         const cs = getComputedStyle(cake)
         out.push({ p, transform: cs.transform, opacity: cs.opacity })
       }
       return { start: st.start, end: st.end, fimCardapio: document.querySelector('#cardapio').getBoundingClientRect().bottom + scrollY - innerHeight, out }
     }
     ```
     Expected: `end` ≈ `fimCardapio` (±2px); opacidade 1 em p=0 e 0.25, decrescente depois, 0 em p=1; escala (de `matrix`) decrescente e 0 em p=1; rotação muda a cada ponto.
  2. Screenshots em 0%, 25%, 50%, 75% do scroll total da página (`document.documentElement.scrollHeight - innerHeight`) — conferir visualmente rotação/encolhimento e que o bolo não cobre textos/botões do hero no mobile.
  3. Review Focus #1: rolar até o meio do cardápio, clicar `#tab-kits` (painel mais curto), esperar 500ms e rodar de novo a avaliação de `end` vs `fimCardapio` — Expected: continuam iguais.
  4. Rolar de volta ao topo — Expected: bolo volta ao tamanho original (transform ≈ `none`/matriz identidade, opacity 1).
  5. `browser_emulate_media` com `reducedMotion: 'reduce'`, recarregar: `.cake-layer` sem `is-fixed` e `getComputedStyle(cake).transform === 'none'` após rolar.

- [ ] **Step 7: Commit**

```bash
git add src/js/cake-scroll.js src/main.js tests/cake-scroll.test.js
git commit -m "feat: scroll-scrubbed cake animation ending at the menu"
```

---

### Task 7: Animações secundárias (reveal + parallax)

**Files:**
- Create: `src/js/reveals.js`, `tests/reveals.test.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `[data-reveal]`, `[data-parallax="<yPercent>"]` (Task 5), `cardapio:change`.
- Produces: `initReveals(root = document): void`. Com reduced motion: não faz nada (conteúdo visível). Cards do cardápio (`.produto`) entram com stagger e reanimam curto (≤ 250ms) ao trocar de aba.

- [ ] **Step 1: Escrever `tests/reveals.test.js`:**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

beforeEach(() => { vi.resetModules(); document.body.innerHTML = '<h2 data-reveal>t</h2>' })

it('com reduced motion não esconde nada', async () => {
  window.matchMedia = vi.fn().mockImplementation((q) => ({ matches: q.includes(': reduce'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))
  const { initReveals } = await import('../src/js/reveals.js')
  initReveals()
  expect(document.querySelector('h2').style.opacity).toBe('')
})
```

- [ ] **Step 2: Rodar** `npm test` — Expected: FAIL.

- [ ] **Step 3: Criar `src/js/reveals.js`:**

```js
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initReveals(root = document) {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 24, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    })

    const revelarCards = (painel) => {
      const cards = painel?.querySelectorAll('.produto')
      if (!cards?.length) return
      gsap.from(cards, {
        opacity: 0, y: 24, duration: 0.6, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: painel, start: 'top 85%', once: true },
      })
    }
    revelarCards(root.querySelector('[role="tabpanel"]:not([hidden])'))

    const aoTrocar = (e) => {
      const painel = root.querySelector(`#panel-${e.detail.id}`)
      gsap.fromTo(painel.querySelectorAll('.produto'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: 'power2.out', overwrite: true })
    }
    document.addEventListener('cardapio:change', aoTrocar)

    root.querySelectorAll('[data-parallax]').forEach((el) => {
      gsap.to(el, {
        yPercent: Number(el.dataset.parallax) || -20, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })

    return () => document.removeEventListener('cardapio:change', aoTrocar)
  })
}
```

Nota: os elementos `.deco` usam `transform: rotate()` no CSS; GSAP lê e preserva a rotação existente ao animar `yPercent`. Confirmar no Step 5 que a rotação das folhas não some.

- [ ] **Step 4: Rodar** `npm test` — Expected: PASS. Adicionar `import { initReveals } from './js/reveals.js'` e `initReveals()` em `src/main.js` depois de `initCakeScroll()`.

- [ ] **Step 5: Validar com Playwright MCP** (390×844): rolar a página inteira devagar (`window.scrollTo` em passos de 400px, 150ms) e tirar screenshot fullPage no fim — Expected: todos os títulos/cards visíveis (opacity 1), folhas ainda rotacionadas, nada de salto. Trocar 3 abas e conferir que os cards aparecem.

- [ ] **Step 6: Commit**

```bash
git add src/js/reveals.js src/main.js tests/reveals.test.js
git commit -m "feat: subtle reveal and parallax animations"
```

---

### Task 8: README e rodada 1 de testes com Playwright (corrigir até passar)

**Files:**
- Create: `README.md`
- Modify: o que os testes apontarem

- [ ] **Step 1: Escrever `README.md`:**

````markdown
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
(Copiar aqui a tabela "Pendentes" do spec §13, P1–P13.)
````

Copiar de fato a tabela P1–P13 do spec para o README (sem abreviar).

- [ ] **Step 2: Larguras e screenshots por seção.** Para cada largura 375, 390, 430, 768, 1440 (altura 844 no mobile, 1024 no tablet, 900 no desktop): `browser_resize` → `browser_navigate` → para cada seção (`#inicio`, `#como-escolher`, `#cardapio`, `#ingredientes`, `#sobre`, `#depoimentos`, `#encomendar`, `footer`) rodar `el.scrollIntoView()` + espera 800ms + `browser_take_screenshot` com nome `w<largura>-<secao>.png` salvo em `$SCRATCHPAD/shots-r1/`. Olhar cada imagem.

- [ ] **Step 3: Scroll horizontal.** Em cada largura e para cada aba do cardápio:
  ```js
  async () => { const r = []; for (const t of document.querySelectorAll('[role="tab"]')) { t.click(); await new Promise(s => setTimeout(s, 300)); r.push([t.id, document.documentElement.scrollWidth <= innerWidth]) } return r }
  ```
  Expected: tudo `true`. Se algum `false`, achar o culpado com `[...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).map(e => e.className)` e corrigir.

- [ ] **Step 4: Bolo em 0/25/50/75%.** Em 390 e 1440, screenshots com `window.scrollTo(0, (scrollHeight - innerHeight) * p)` para p = 0, 0.25, 0.5, 0.75 → `$SCRATCHPAD/shots-r1/bolo-<largura>-<p>.png`. Repetir a avaliação numérica da Task 6 Step 6.1.

- [ ] **Step 5: Interações.**
  - Menu (390): clicar `[data-menu-toggle]` → nav visível e `aria-expanded="true"`; screenshot; Esc → fechado; abrir e clicar em "Cardápio" → fechado e rolou até `#cardapio`.
  - WhatsApp: `browser_evaluate` lista `href` de todos `[data-whatsapp]` e `[data-pedido]`; Expected: todos começam com `https://wa.me/5511942237434?text=`. Trocar tamanho de um card (clicar no label "Médio") e conferir `href` decodificado com "Médio". Clicar no botão do hero-final ("Pedir pelo WhatsApp") e conferir via `browser_tabs` que abriu uma aba para `wa.me`/`api.whatsapp.com` (fechar a aba depois).
  - Review Focus #5: `browser_run_code_unsafe` bloqueando `**/cardapio/granola.jpg` (`page.route(..., r => r.abort())`), recarregar, abrir aba Granola — Expected: card mantém proporção (foto com fundo bege), sem quebra.
  - `browser_console_messages` — Expected: sem erros.

- [ ] **Step 6: Corrigir tudo que falhou** e repetir os Steps 2–5 até passar. Rodar `npm test && npm run build`.

- [ ] **Step 7: Commit**

```bash
git add -A README.md src index.html
git commit -m "docs: README with edit guide; fixes from Playwright round 1"
```

---

### Task 9: Auditoria e polimento com impeccable + rodada 2 de testes

**Files:**
- Modify: `src/styles/*.css`, `index.html`, `src/js/*` conforme a auditoria

- [ ] **Step 1: Rodar a skill `impeccable`** pedindo auditoria completa da página em http://localhost:5173 (mobile 390 primeiro, depois 768 e 1440): contraste, alinhamentos, espaçamento, hierarquia, estados hover/foco/toque, acessibilidade, detalhes visuais. Informar: "A estrela é o bolo animado; prioridade mobile; a inspiração é a landing NOURA (creme, terracota, sálvia, marinho, papel rasgado)". Salvar a lista de achados em `$SCRATCHPAD/impeccable-achados.md`.

- [ ] **Step 2: Corrigir cada achado**, um commit por grupo (ex.: "fix(a11y): …", "style: spacing …"). Achados que conflitem com a inspiração ou a prioridade mobile: decidir a favor delas e anotar o motivo.

- [ ] **Step 3: Rodada 2 do Playwright:** repetir integralmente os Steps 2–5 da Task 8 salvando em `$SCRATCHPAD/shots-r2/`. Corrigir regressões.

- [ ] **Step 4: Rodar** `npm test && npm run build` — Expected: PASS e build OK.

- [ ] **Step 5: Commit final do polimento**

```bash
git add -A src index.html
git commit -m "style: impeccable audit fixes"
```

---

### Task 10: Entrega

- [ ] **Step 1:** Mostrar ao usuário os screenshots mobile da rodada 2 (375/390/430 por seção + bolo 0/25/50/75%).
- [ ] **Step 2:** Resumo das correções da auditoria impeccable (agrupadas).
- [ ] **Step 3:** Guia "onde trocar" (tabela do README) e a lista de pendências P1–P13.
- [ ] **Step 4:** Perguntar sobre integração da branch (`superpowers:finishing-a-development-branch`).
