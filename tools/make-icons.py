"""Draws the app icon into icons/.

    python tools/make-icons.py

Run it when the mark changes; the four PNGs it writes are what ships. Needs
Pillow and nothing else. The brass vault this replaced is in the history if
it is ever wanted back.

The mark: a rising bar chart with the two currencies over it, no frame.

Same shading grammar as the vault it replaces — a bevel taken from the shape
minus itself offset, light from the top-left, a cast shadow — so it still
belongs to the same family without borrowing the frame.
"""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops

S = 512
K = 2
W = S * K

GOLD_HI, GOLD_LO = (247, 220, 138), (150, 110, 20)

# Each bar its own colour, taken from the chart palette the app already uses
# (hsl(h 82% L), the 22–42 band) so the icon and the charts are one system.
BARS = [
    # (hue, lightness, height as a fraction of the plot)
    (199, 34, 0.42),   # blue
    (152, 36, 0.60),   # green
    (281, 36, 0.78),   # violet
    (18,  34, 1.00),   # terracotta
]


def hsl_rgb(h, s, l):
    s /= 100; l /= 100
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    r, g, b = [(c, x, 0), (x, c, 0), (0, c, x), (0, x, c), (x, 0, c), (c, 0, x)][int(h // 60) % 6]
    return tuple(round((v + m) * 255) for v in (r, g, b))


def bevel(mask, off, blur):
    down = ImageChops.offset(mask, off, off)
    up = ImageChops.offset(mask, -off, -off)
    hi = ImageChops.multiply(ImageChops.subtract(mask, down), mask)
    sh = ImageChops.multiply(ImageChops.subtract(mask, up), mask)
    hi = ImageChops.multiply(hi.filter(ImageFilter.GaussianBlur(blur)), mask)
    sh = ImageChops.multiply(sh.filter(ImageFilter.GaussianBlur(blur)), mask)
    return hi, sh


def paint(img, mask, colour, alpha=255):
    img.paste(Image.new("RGBA", img.size, colour + (alpha,)), (0, 0), mask)


def lit(a, b, box):
    """A gradient running top-left to bottom-right across the given box."""
    x0, y0, x1, y1 = box
    g = Image.new("RGB", (W, W), b)
    px = g.load()
    for y in range(max(0, y0), min(W, y1)):
        fy = (y - y0) / max(1, y1 - y0)
        for x in range(max(0, x0), min(W, x1)):
            t = min(1.0, ((x - x0) / max(1, x1 - x0)) * 0.4 + fy * 0.6)
            px[x, y] = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
    return g


def plate(transparent):
    if transparent:
        return Image.new("RGBA", (W, W), (0, 0, 0, 0))
    base = Image.new("RGB", (W, W))
    px = base.load()
    top, bot = (27, 36, 43), (11, 17, 21)
    for y in range(W):
        c = tuple(round(top[i] + (bot[i] - top[i]) * (y / W)) for i in range(3))
        for x in range(W):
            px[x, y] = c
    base = base.convert("RGBA")
    random.seed(7)
    n = Image.new("L", (W // 3, W // 3))
    n.putdata([random.randint(120, 136) for _ in range((W // 3) ** 2)])
    n = n.resize((W, W), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.8 * K))
    paint(base, n.point(lambda v: max(0, (v - 128) * 5)), (127, 178, 204))
    return base


def glyph_mask(ch, size, cx, cy):
    """A currency sign, drawn from the font and centred where asked."""
    from PIL import ImageFont
    m = Image.new("L", (W, W), 0)
    d = ImageDraw.Draw(m)
    font = None
    for path in ("C:/Windows/Fonts/seguisb.ttf", "C:/Windows/Fonts/segoeui.ttf",
                 "C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf"):
        try:
            font = ImageFont.truetype(path, size)
            if font.getbbox(ch)[2] > font.getbbox(ch)[0]:
                break
        except OSError:
            continue
    d.text((cx, cy), ch, font=font, fill=255, anchor="mm")
    return m


def build(transparent=False, scale=1.0, centre=(256, 262)):
    img = plate(transparent)
    cx, cy = centre[0] * K, centre[1] * K

    plot_w = 344 * K * scale
    plot_h = 250 * K * scale
    base_y = cy + plot_h * 0.52
    gap = plot_w * 0.075
    bw = (plot_w - gap * (len(BARS) - 1)) / len(BARS)

    for idx, (h, l, frac) in enumerate(BARS):
        x0 = cx - plot_w / 2 + idx * (bw + gap)
        bh = plot_h * frac
        y0 = base_y - bh
        box = (round(x0), round(y0), round(x0 + bw), round(base_y))

        m = Image.new("L", (W, W), 0)
        ImageDraw.Draw(m).rounded_rectangle(box, radius=round(bw * 0.22), fill=255)

        # its own shadow on the ground, so the bars sit rather than float
        paint(img, ImageChops.offset(m.filter(ImageFilter.GaussianBlur(7 * K)),
                                     round(3 * K), round(7 * K)), (0, 0, 0), 105)
        img.paste(lit(hsl_rgb(h, 82, l + 14), hsl_rgb(h, 82, max(8, l - 12)), box), (0, 0), m)
        hi, sh = bevel(m, round(4 * K * scale), 3 * K * scale)
        paint(img, hi, (255, 255, 255), 105)
        paint(img, sh, (0, 0, 0), 120)

    # the two currencies, in gold, over the bars they belong to
    sz = round(168 * K * scale)
    for ch, gx, gy in (("€", cx - plot_w * 0.30, cy - plot_h * 0.02),
                       ("₹", cx + plot_w * 0.16, cy - plot_h * 0.36)):
        m = glyph_mask(ch, sz, gx, gy)
        paint(img, ImageChops.offset(m.filter(ImageFilter.GaussianBlur(5 * K)),
                                     round(2 * K), round(5 * K)), (0, 0, 0), 165)
        box = m.getbbox() or (0, 0, W, W)
        img.paste(lit(GOLD_HI, GOLD_LO, box), (0, 0), m)
        hi, sh = bevel(m, round(3 * K * scale), 2.2 * K * scale)
        paint(img, hi, (255, 244, 198), 190)
        paint(img, sh, (40, 24, 4), 190)

    return img.resize((S, S), Image.LANCZOS)


if __name__ == "__main__":
    import os
    here = os.path.dirname(os.path.abspath(__file__))
    icons = os.path.join(here, "..", "icons")

    art = build()
    art.save(os.path.join(icons, "icon-512.png"))
    art.resize((192, 192), Image.LANCZOS).save(os.path.join(icons, "icon-192.png"))

    # Android crops the maskable one to a shape of its own, so the mark shrinks
    # into the safe circle and the ground bleeds to the edges behind it.
    build(scale=0.72, centre=(256, 256)).save(os.path.join(icons, "icon-maskable-512.png"))

    # iOS masks it too, and would rather not be handed an alpha channel
    flat = Image.new("RGB", (S, S), (14, 20, 25))
    a = art.convert("RGBA")
    flat.paste(a, (0, 0), a)
    flat.resize((180, 180), Image.LANCZOS).save(os.path.join(icons, "apple-touch-icon.png"))

    print("wrote icon-512, icon-192, icon-maskable-512, apple-touch-icon")
