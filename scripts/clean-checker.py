# Quita el cuadriculado de "transparencia" que algunos exportadores PINTAN
# dentro de la imagen. No es transparencia real: son píxeles grises y blancos,
# y por eso salían con el damero encima del video.
# Se reemplaza por blanco, que es lo correcto para un sticker.
import sys
from PIL import Image

path = sys.argv[1]
im = Image.open(path)
if "A" in im.mode:            # ya tiene transparencia de verdad: no se toca
    sys.exit(0)

im = im.convert("RGB")
px = im.load()
w, h = im.size
changed = 0
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        # Gris claro o blanco = damero. Se exige poca saturación para no
        # tocar colores claros de verdad (el amarillo del queso, el rosa).
        if r > 186 and g > 186 and b > 186 and max(r, g, b) - min(r, g, b) < 14:
            if (r, g, b) != (255, 255, 255):
                changed += 1
            px[x, y] = (255, 255, 255)
im.save(path)
print(f"  · {path.split('/')[-1]}: {changed} píxeles de damero → blanco")
