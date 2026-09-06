"""Draws the app icon — a brass vault door — into icons/.

    python tools/make-icons.py

Run it when the mark changes; the four PNGs it writes are what ships. Needs
Pillow and nothing else.

The vault door is rendered rather than drawn flat.

Everything that reads as metal here is one of three things: a bevel (the shape
minus itself offset, blurred — light on the top-left sliver, shade on the
bottom-right), spun brushing (a few thousand faint radial streaks, blurred),
and a cast shadow. Light comes from the top-left throughout; nothing is shaded
against it, which is what makes the parts look like one object.
"""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops

S = 512
K = 2                      # drawn at 2× and downsampled
W = S * K
CX, CY = 246 * K, 260 * K  # door centre

STEEL_HI = (238, 206, 126)
STEEL_MID = (172, 133, 52)
STEEL_LO = (104, 74, 20)
STEEL_DEEP = (54, 37, 9)


# ---------- helpers ----------

def disc(r, cx=None, cy=None, fill=255, mode="L", size=None):
    cx = CX if cx is None else cx
    cy = CY if cy is None else cy
    img = Image.new(mode, size or (W, W), 0)
    ImageDraw.Draw(img).ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill)
    return img


def ring_mask(r_out, r_in, cx=None, cy=None):
    cx = CX if cx is None else cx
    cy = CY if cy is None else cy
    m = disc(r_out, cx, cy)
    ImageDraw.Draw(m).ellipse([cx - r_in, cy - r_in, cx + r_in, cy + r_in], fill=0)
    return m


def bevel(mask, off=5 * K, blur=3.5 * K):
    """Inner light and shade for a raised shape lit from the top-left."""
    down = ImageChops.offset(mask, off, off)
    up = ImageChops.offset(mask, -off, -off)
    hi = ImageChops.multiply(ImageChops.subtract(mask, down), mask)
    sh = ImageChops.multiply(ImageChops.subtract(mask, up), mask)
    return (hi.filter(ImageFilter.GaussianBlur(blur)),
            sh.filter(ImageFilter.GaussianBlur(blur)))


def paint(img, mask, colour, alpha=255):
    layer = Image.new("RGBA", img.size, colour + (alpha,))
    img.paste(layer, (0, 0), mask)


def lit_gradient(a, b):
    """Top-left to bottom-right — the direction the light runs."""
    g = Image.new("RGB", (W, W))
    px = g.load()
    for y in range(W):
        fy = y / W
        for x in range(0, W, 2):
            t = min(1.0, (x / W) * 0.45 + fy * 0.55)
            c = (round(a[0] + (b[0] - a[0]) * t),
                 round(a[1] + (b[1] - a[1]) * t),
                 round(a[2] + (b[2] - a[2]) * t))
            px[x, y] = c
            if x + 1 < W:
                px[x + 1, y] = c
    return g


def spun(r, seed=11):
    """Brushed steel: faint streaks running out from the middle."""
    random.seed(seed)
    t = Image.new("L", (W, W), 128)
    d = ImageDraw.Draw(t)
    for i in range(2600):
        a = random.random() * math.tau
        v = 128 + random.randint(-34, 34)
        r0 = random.uniform(0, r * 0.25)
        d.line([CX + math.cos(a) * r0, CY + math.sin(a) * r0,
                CX + math.cos(a) * r, CY + math.sin(a) * r], fill=v, width=K)
    return t.filter(ImageFilter.GaussianBlur(1.1 * K))


def rounded_bar(d, x0, y0, x1, y1, r, fill=255):
    d.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill)


# ---------- the plate everything sits on ----------

def plate(frame=True):
    base = Image.new("RGB", (W, W))
    px = base.load()
    top, bot = (27, 36, 43), (11, 17, 21)
    for y in range(W):
        t = y / W
        c = tuple(round(top[i] + (bot[i] - top[i]) * t) for i in range(3))
        for x in range(W):
            px[x, y] = c
    base = base.convert("RGBA")

    random.seed(7)
    n = Image.new("L", (W // 3, W // 3))
    n.putdata([random.randint(120, 136) for _ in range((W // 3) ** 2)])
    n = n.resize((W, W), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.8 * K))
    paint(base, n.point(lambda v: max(0, (v - 128) * 5)), (127, 178, 204), 255)

    if not frame:
        return base

    d = ImageDraw.Draw(base)
    x0, y0, x1, y1 = 46 * K, 46 * K, 466 * K, 466 * K
    col, wdt, dash, gap = (159, 199, 222, 128), 3 * K, 9 * K, 9 * K
    def dashed(ax, ay, bx, by):
        span = math.hypot(bx - ax, by - ay)
        ux, uy = (bx - ax) / span, (by - ay) / span
        t = 0.0
        while t < span:
            e = min(t + dash, span)
            d.line([ax + ux * t, ay + uy * t, ax + ux * e, ay + uy * e], fill=col, width=wdt)
            t = e + gap
    dashed(x0, y0, x1, y0); dashed(x1, y0, x1, y1)
    dashed(x1, y1, x0, y1); dashed(x0, y1, x0, y0)
    for cx, cy in [(x0, y0), (x1, y0), (x0, y1), (x1, y1)]:
        d.ellipse([cx - 5 * K, cy - 5 * K, cx + 5 * K, cy + 5 * K], fill=(159, 199, 222, 150))
    return base


# ---------- the door ----------

R_FRAME_OUT = 168 * K
R_FRAME_IN = 137 * K
R_DOOR = 135 * K
R_GROOVE = 113 * K
R_FACE = 104 * K
R_HUB = 31 * K


def build(scale=1.0, centre=None, frame=True, rounded=True):
    global CX, CY, R_FRAME_OUT, R_FRAME_IN, R_DOOR, R_GROOVE, R_FACE, R_HUB
    CX, CY = centre or (246 * K, 260 * K)
    R_FRAME_OUT = round(168 * K * scale); R_FRAME_IN = round(137 * K * scale)
    R_DOOR = round(135 * K * scale);      R_GROOVE = round(113 * K * scale)
    R_FACE = round(104 * K * scale);      R_HUB = round(31 * K * scale)
    img = plate(frame)
    steel = lit_gradient(STEEL_HI, STEEL_LO)
    dark_steel = lit_gradient(STEEL_MID, STEEL_DEEP)
    brush = spun(R_DOOR)

    # --- cast shadow of the whole assembly
    sh = disc(R_FRAME_OUT).filter(ImageFilter.GaussianBlur(14 * K))
    paint(img, ImageChops.offset(sh, 4 * K, 10 * K), (0, 0, 0), 150)

    # --- recessed frame the door sits in
    frame = ring_mask(R_FRAME_OUT, R_FRAME_IN)
    img.paste(dark_steel, (0, 0), frame)
    fh, fs = bevel(frame, 4 * K, 3 * K)
    paint(img, fh, (240, 214, 150), 120)
    paint(img, fs, (28, 17, 4), 190)

    # --- the seam behind the door, so the door reads as a separate piece
    seam = ring_mask(R_FRAME_IN, R_DOOR - 2 * K)
    paint(img, seam.filter(ImageFilter.GaussianBlur(1.5 * K)), (20, 12, 3), 235)

    # --- door face: brushed steel, lit from the top-left
    door = disc(R_DOOR)
    face = Image.composite(steel, Image.new("RGB", (W, W), STEEL_MID),
                           brush.point(lambda v: min(255, max(0, (v - 96) * 3))))
    face = Image.blend(face, steel, 0.45)
    img.paste(face, (0, 0), door)
    dh, ds = bevel(door, 6 * K, 4 * K)
    paint(img, dh, (253, 232, 172), 165)
    paint(img, ds, (32, 20, 5), 200)

    # --- concentric grooves cut into the face
    for r, deep in ((R_GROOVE, True), (R_FACE, False)):
        g = ring_mask(r, r - 5 * K)
        gh, gs = bevel(g, 2 * K, 1.6 * K)
        paint(img, g.filter(ImageFilter.GaussianBlur(1.2 * K)), (46, 29, 8), 175 if deep else 140)
        paint(img, gs, (242, 214, 146), 110)

    # --- inner face, very slightly proud
    inner = disc(R_FACE - 5 * K)
    img.paste(Image.blend(face, steel, 0.25), (0, 0), inner)
    ih, isd = bevel(inner, 3 * K, 2.4 * K)
    paint(img, ih, (246, 222, 158), 120)
    paint(img, isd, (36, 22, 6), 150)

    # --- the handle: eight spokes with rounded ends
    spokes = Image.new("L", (W, W), 0)
    sd = ImageDraw.Draw(spokes)
    for a in range(0, 360, 45):
        rad = math.radians(a)
        x1, y1 = CX + math.cos(rad) * 22 * K * scale, CY + math.sin(rad) * 22 * K * scale
        x2, y2 = CX + math.cos(rad) * 90 * K * scale, CY + math.sin(rad) * 90 * K * scale
        sd.line([x1, y1, x2, y2], fill=255, width=round(14 * K * scale))
        for cx, cy, rr in ((x2, y2, 8 * K * scale), (x1, y1, 8 * K * scale)):
            sd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=255)
    ssh = spokes.filter(ImageFilter.GaussianBlur(4 * K))
    paint(img, ImageChops.offset(ssh, 3 * K, 5 * K), (26, 16, 4), 175)
    img.paste(steel, (0, 0), spokes)
    sph, sps = bevel(spokes, 3 * K, 2.2 * K)
    paint(img, sph, (255, 238, 180), 190)
    paint(img, sps, (36, 22, 6), 190)

    # --- hub, domed
    hub = disc(R_HUB)
    hsh = hub.filter(ImageFilter.GaussianBlur(5 * K))
    paint(img, ImageChops.offset(hsh, 3 * K, 6 * K), (26, 16, 4), 190)
    img.paste(steel, (0, 0), hub)
    hh, hs = bevel(hub, 5 * K, 3.5 * K)
    paint(img, hh, (255, 242, 194), 200)
    paint(img, hs, (36, 22, 6), 195)
    cap = disc(round(13 * K * scale))
    paint(img, cap, (198, 158, 70), 255)
    ch, cs = bevel(cap, 2 * K, 1.6 * K)
    paint(img, cs, (250, 228, 166), 170)
    paint(img, ch, (44, 28, 8), 170)
    # specular on the dome
    spec = disc(11 * K * scale, CX - 11 * K * scale, CY - 12 * K * scale).filter(ImageFilter.GaussianBlur(6 * K))
    paint(img, spec, (255, 255, 255), 95)

    # --- rivets around the frame
    for a in range(0, 360, 45):
        rad = math.radians(a + 22.5)
        bx = CX + math.cos(rad) * 152 * K * scale
        by = CY + math.sin(rad) * 152 * K * scale
        rv = disc(9 * K * scale, bx, by)
        img.paste(steel, (0, 0), rv)
        rh, rs = bevel(rv, 2 * K, 1.5 * K)
        paint(img, rh, (255, 240, 184), 210)
        paint(img, rs, (8, 13, 17), 200)

    # --- hinges, so it is a door and not a dial
    for hy in (CY - 86 * K * scale, CY + 86 * K * scale):
        hg = Image.new("L", (W, W), 0)
        hd = ImageDraw.Draw(hg)
        rounded_bar(hd, CX + 150 * K * scale, hy - 24 * K * scale, CX + 196 * K * scale, hy + 24 * K * scale, 10 * K)
        img.paste(dark_steel, (0, 0), hg)
        hh2, hs2 = bevel(hg, 3 * K, 2 * K)
        paint(img, hh2, (236, 210, 144), 150)
        paint(img, hs2, (28, 17, 4), 190)

    out = img.resize((S, S), Image.LANCZOS)

    if rounded:
        corner = Image.new("L", (S * 4, S * 4), 0)
        ImageDraw.Draw(corner).rounded_rectangle([0, 0, S * 4 - 1, S * 4 - 1],
                                                 radius=104 * 4, fill=255)
        out.putalpha(corner.resize((S, S), Image.LANCZOS))
    return out


if __name__ == "__main__":
    import os
    here = os.path.dirname(os.path.abspath(__file__))
    icons = os.path.join(here, "..", "icons")

    art = build()
    art.resize((512, 512), Image.LANCZOS).save(os.path.join(icons, "icon-512.png"))
    art.resize((192, 192), Image.LANCZOS).save(os.path.join(icons, "icon-192.png"))

    # Android crops the maskable one itself, so the plate bleeds to the edge,
    # the dashed frame comes off, and the door shrinks into the safe circle
    build(scale=0.66, centre=(256 * K, 256 * K), frame=False, rounded=False)         .convert("RGB").save(os.path.join(icons, "icon-maskable-512.png"))

    # iOS masks it too, and would rather not be handed an alpha channel
    flat = Image.new("RGB", (S, S), (12, 18, 22))
    flat.paste(art, (0, 0), art)
    flat.resize((180, 180), Image.LANCZOS).save(os.path.join(icons, "apple-touch-icon.png"))

    print("wrote icon-512, icon-192, icon-maskable-512, apple-touch-icon")
