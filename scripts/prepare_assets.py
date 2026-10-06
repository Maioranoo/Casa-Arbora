"""Extrai e prepara as imagens do site a partir dos PDFs em assets-src/.
Uso: python scripts/prepare_assets.py   (requer: pip install pymupdf pillow numpy)
"""
import io
from pathlib import Path
import numpy as np
import pymupdf
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

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

def logos_da_pagina(pdf, pagina):
    """Imagens RGBA da página, compondo cada uma com sua máscara suave (smask) do PDF."""
    doc = pymupdf.open(SRC / pdf)
    out = []
    for x in doc[pagina].get_images(full=True):
        pix = pymupdf.Pixmap(doc, x[0])
        if x[1]:
            pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(doc, x[1]))
        out.append(Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGBA"))
    return out

# Variações raster (1000px) do PDF de logos, pág. 2: 0 = wordmark creme (transparente, 500px),
# 1 = planta + wordmark terracota no amarelo, 2 = preto no branco, 6 = wordmark marrom no quadrado creme...
LOGOS = logos_da_pagina("logos.pdf", 1)
AMARELO_LOGO = (255, 203, 101)   # fundo da variação 1
CREME_LOGO = (248, 246, 221)     # fundo da variação 6

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
    img = img.convert("RGB")
    fundo = img.getpixel((2, 2))
    diff = ImageChops.difference(img, Image.new("RGB", img.size, fundo))
    r, g, b = diff.split()
    soma = ImageChops.add(ImageChops.add(r, g), b)  # satura em 255 (> limiar de qualquer forma)
    mascara = soma.point(lambda v: 255 if v > limiar else 0)
    # abertura morfológica: remove traços finos soltos (o aro dos selos é desenhado à mão)
    mascara = mascara.filter(ImageFilter.MinFilter(15)).filter(ImageFilter.MaxFilter(15))
    return mascara.getbbox()

def limpar_transparentes(img):
    """Zera o RGB dos pixels 100% transparentes (comprime melhor, sem mudar o visual)."""
    img = img.convert("RGBA")
    preto = Image.new("RGBA", img.size, (0, 0, 0, 0))
    return Image.composite(img, preto, img.getchannel("A").point(lambda a: 255 if a else 0))

def salvar_png_alfa(img, destino, cores=256):
    """PNG com transparência, quantizado (paleta com alfa) e otimizado."""
    img = limpar_transparentes(img)
    if cores:
        img = img.quantize(colors=cores, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
    img.save(destino, optimize=True)

def selo(nome):
    img = Image.open(SRC / "selos" / f"{nome}.jpg").convert("RGB")
    x0, y0, x1, y1 = bbox_fora_do_fundo(img)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    r = min(x1 - x0, y1 - y0) // 2 - 4
    destino = OUT / "selos" / f"{nome}.png"
    destino.parent.mkdir(parents=True, exist_ok=True)
    # 192px = 2x do maior uso (96px em "Como escolher"); nas tags aparece a 20px
    salvar_png_alfa(circulo(img, cx, cy, r, 192), destino)

def chave(img, fundo, t0=18, t1=70):
    """Remove uma cor de fundo sólida (color-key com borda suave), recupera a cor do primeiro plano e apara."""
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    f = np.array(fundo, np.float32)
    dist = np.sqrt(((a - f) ** 2).sum(-1))
    alfa = np.clip((dist - t0) / (t1 - t0), 0, 1)
    cor = np.clip((a - (1 - alfa[..., None]) * f) / np.maximum(alfa, 1e-3)[..., None], 0, 255)
    out = Image.fromarray(np.dstack([cor, alfa * 255]).astype(np.uint8), "RGBA")
    return out.crop(out.getchannel("A").getbbox())

def para_altura(img, altura):
    return img.resize((round(img.width * altura / img.height), altura), Image.LANCZOS)

def salvar_logo(img, nome):
    """PNG com alfa quantizado (fallback) + WebP lossless da mesma paleta (menor que o PNG e sem artefatos)."""
    salvar_png_alfa(img, OUT / f"{nome}.png")
    Image.open(OUT / f"{nome}.png").convert("RGBA").save(OUT / f"{nome}.webp", "WEBP", lossless=True, method=6)

def icones():
    """Favicons e apple-touch-icon: só a planta da variação 1, centrada no amarelo."""
    v1 = LOGOS[1].convert("RGB")
    a = np.asarray(v1).astype(np.float32)
    dist = np.sqrt(((a - np.array(AMARELO_LOGO, np.float32)) ** 2).sum(-1))
    traco = Image.fromarray((np.clip((dist - 30) / 60, 0, 1) * 255).astype(np.uint8), "L")
    linhas = (np.asarray(traco) > 128).sum(1)
    corte = next(y for y in range(500, v1.height) if linhas[y] == 0)  # faixa vazia entre o vaso e o wordmark
    planta = traco.crop((0, 0, v1.width, corte))
    planta = planta.crop(planta.getbbox())
    solidos = a[:corte][np.asarray(traco)[:corte] > 250]
    cor = tuple(int(c) for c in np.median(solidos, 0))  # terracota da linha
    def icone(lado, engrossa, margem, cantos=True):
        # engrossa: MaxFilter na máscara em 1000px antes de reduzir (a linha some em 32px sem isso)
        m = planta.filter(ImageFilter.MaxFilter(engrossa)) if engrossa > 1 else planta
        tela_lado = round(max(m.size) / (1 - 2 * margem))
        tela = Image.new("L", (tela_lado, tela_lado), 0)
        tela.paste(m, ((tela_lado - m.width) // 2, (tela_lado - m.height) // 2))
        img = Image.new("RGBA", (lado, lado), AMARELO_LOGO + (255,))
        img.paste(Image.new("RGBA", (lado, lado), cor + (255,)), (0, 0), tela.resize((lado, lado), Image.LANCZOS))
        if cantos:  # quadrado com cantos arredondados, transparente fora
            k = 4
            r = Image.new("L", (lado * k, lado * k), 0)
            ImageDraw.Draw(r).rounded_rectangle((0, 0, lado * k - 1, lado * k - 1), radius=round(lado * k * 0.22), fill=255)
            img.putalpha(r.resize((lado, lado), Image.LANCZOS))
        return img
    icone(32, 19, 0.10).save(OUT / "favicon-32.png", optimize=True)
    icone(64, 13, 0.10).save(OUT / "favicon.png", optimize=True)
    icone(180, 5, 0.16, cantos=False).convert("RGB").save(OUT / "apple-touch-icon.png", optimize=True)  # iOS arredonda

def logos():
    # Topo: wordmark marrom (variação 6) sem o quadrado creme; exibido a 40px de altura → 3x
    salvar_logo(para_altura(chave(LOGOS[6], CREME_LOGO), 120), "logo")
    # Rodapé: wordmark creme (variação 0, já transparente), aparado; exibido a 56px de altura (~1.7x; tamanho nativo de 96px)
    v0 = LOGOS[0]
    salvar_logo(v0.crop(v0.getchannel("A").getbbox()), "logo-claro")
    # Preloader: planta + wordmark terracota (variação 1) sem o amarelo; exibido a 240px de altura → 2x
    salvar_logo(para_altura(chave(LOGOS[1], AMARELO_LOGO, 30, 90), 480), "logo-preloader")

# ---- Fotos do cardápio: id -> imagem ----
CARDAPIO = {
    "classico-limao-mirtilos": SET[1],
    "classico-banana-amoras": SET[21],
    "classico-banana-maca": SET[20],
    "classico-cacau-tamaras": SET[19],
    "classico-pera-amendoas": SET[3],
    "classico-cenoura-damasco-cacau": GPT[13],
    "classico-mandala-morango": GPT[0],
    "festa-limao-mirtilos": SET[5],
    "festa-cacau-tamaras": SET[6],
    "festa-damasco-banana": SET[7],
    "vegano-chocolatudo": SET[8],
    "vegano-limao-siciliano": SET[10],
    "vegano-chocolate-banana": ANT[0],            # TODO(conteúdo) P5: baixa resolução
    "vegano-cenoura-tamara": SET[11],
    "vegano-baunilha": SET[9],
    "docinho-cacau-avela": SET[12],
    "docinho-beijinho": SET[14],
    "docinho-cajuzinho": SET[13],
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

def main():
    for nome in ("baby-friendly", "sem-gluten", "vegano"):
        selo(nome)
    for id_, img in CARDAPIO.items():
        salvar_jpg(quadrada(img), OUT / "cardapio" / f"{id_}.jpg")
    for id_, img in KITS.items():
        salvar_jpg(img, OUT / "cardapio" / f"{id_}.jpg")
    # Bolo visto de cima (ajustar BOLO_* olhando a prévia gerada)
    b = SET[19]
    assert b.size == (872, 894), b.size  # fonte mudou: reajustar BOLO_*
    BOLO_CX, BOLO_CY, BOLO_R = 440, 458, 335  # círculo inscrito no topo do bolo (sem caixa/prato)
    # Sem ampliar além do recorte da fonte (2*BOLO_R = 670px). WebP com alfa (principal) + PNG de fallback.
    bolo = limpar_transparentes(circulo(b, BOLO_CX, BOLO_CY, BOLO_R, 2 * BOLO_R))
    bolo.save(OUT / "bolo-topo.webp", "WEBP", quality=78, method=6, exact=False)
    salvar_png_alfa(bolo, OUT / "bolo-topo.png")
    # Logos e ícones a partir do PDF de logos (P10: raster 1000px; SVG vetorial ainda ideal)
    logos()
    icones()
    # Decorações
    salvar_jpg(quadrada(SET[18], 700), OUT / "deco" / "frutas-folha.jpg")
    print("ok")

if __name__ == "__main__":
    main()
