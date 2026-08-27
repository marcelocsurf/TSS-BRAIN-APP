# Quita el cuadriculado de "transparencia" que algunos exportadores PINTAN
# dentro de la imagen. No es transparencia real: son píxeles grises y blancos,
# y por eso salían con el damero encima del video.
#
# Por defecto se reemplaza por BLANCO, que es lo correcto para los stickers
# troquelados de Marcelo: tienen su borde blanco y se ven PEGADOS sobre el
# video, no transparentes.
#
# Con --cutout se recorta a transparente en vez de blanquear. Es para las
# formas que se usan como marca encima del video —el triángulo del ángulo—
# donde un cuadrado blanco de 900×900 taparía la ola.
#
#   python3 clean-checker.py archivo.png [--cutout]
import sys
from PIL import Image

path = sys.argv[1]
cutout = "--cutout" in sys.argv[2:]

im = Image.open(path)
if "A" in im.mode and not cutout:
    sys.exit(0)                      # ya tiene transparencia de verdad

im = im.convert("RGBA")
px = im.load()
w, h = im.size
changed = 0

def is_checker(r, g, b):
    # Gris claro o blanco = damero. Se exige poca saturación para no tocar
    # colores claros de verdad (el amarillo del queso, el rosa).
    return r > 186 and g > 186 and b > 186 and max(r, g, b) - min(r, g, b) < 14

if cutout:
    # El damero rodea la forma: se recorta desde los bordes hacia adentro
    # (flood fill) para NO agujerear los blancos internos del dibujo.
    seen = [[False] * w for _ in range(h)]
    stack = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
    stack += [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x]:
            continue
        seen[y][x] = True
        r, g, b, a = px[x, y]
        if a == 0:
            stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
            continue
        if not is_checker(r, g, b):
            continue
        px[x, y] = (r, g, b, 0)
        changed += 1
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    im.save(path)
    print(f"  · {path.split('/')[-1]}: {changed} píxeles de damero → recortados")
else:
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if is_checker(r, g, b):
                if (r, g, b) != (255, 255, 255):
                    changed += 1
                px[x, y] = (255, 255, 255, 255)
    im.save(path)
    print(f"  · {path.split('/')[-1]}: {changed} píxeles de damero → blanco")
