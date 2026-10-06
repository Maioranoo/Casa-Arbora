"""Extrai e prepara as imagens do site a partir dos PDFs em assets-src/.
Uso: python scripts/prepare_assets.py   (requer: pip install pymupdf pillow)
"""
import io
from pathlib import Path
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

def selo(nome):
    img = Image.open(SRC / "selos" / f"{nome}.jpg").convert("RGB")
    x0, y0, x1, y1 = bbox_fora_do_fundo(img)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    r = min(x1 - x0, y1 - y0) // 2 - 4
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
    "classico-limao-mirtilos": SET[1],
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
    b = SET[19]
    assert b.size == (872, 894), b.size  # fonte mudou: reajustar BOLO_*
    BOLO_CX, BOLO_CY, BOLO_R = 440, 458, 335  # círculo inscrito no topo do bolo (sem caixa/prato)
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
