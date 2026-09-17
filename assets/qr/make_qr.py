#!/usr/bin/env python3
"""
Generate the printable, branded QR codes for the 3D MI Reports demos.

    python3 -m venv .venv && .venv/bin/pip install "qrcode[pil]"
    .venv/bin/python assets/qr/make_qr.py

Outputs (assets/qr/):
    qr-spine.png / qr-brain.png     bare codes, anatomy icon in the centre
    card-spine.png / card-brain.png A6 print cards at 300 dpi (title, code,
                                    instructions, URL, group lock-up)

Each code uses error-correction level H (30 % redundancy) so the icon in the
centre does not break scanning; the disc covers ~22 % of the code width.
"""
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import RadialGradiantColorMask
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent
BASE = "https://bimcv-csusp.github.io/3D-MI-Reports/"
INK = (24, 0, 64)          # brand indigo
INK_MUTED = (92, 86, 112)
WHITE = (255, 255, 255)

CODES = {
    "spine": dict(
        url=BASE + "spine-visualization/?lang=es",
        centre=(56, 112, 224), edge=(24, 0, 64),            # brand blue -> indigo
        kicker="EXPLORA EN 3D", title="La columna vertebral", subtitle="Spine · 3D viewer",
        how="Apunta con la cámara del móvil al código y toca el enlace.\n"
            "Gira la columna, quita los músculos y córtala por la mitad.",
        short_url="bimcv-csusp.github.io/3D-MI-Reports/spine-visualization/",
    ),
    "brain": dict(
        url=BASE + "brain-visualization/?lang=es",
        centre=(124, 77, 255), edge=(24, 0, 64),            # violet -> indigo
        kicker="EXPLORA EN 3D", title="El cerebro", subtitle="Brain · 3D report",
        how="Apunta con la cámara del móvil al código y toca el enlace.\n"
            "Busca el tumor, mira a través del cerebro y córtalo por la mitad.",
        short_url="bimcv-csusp.github.io/3D-MI-Reports/brain-visualization/",
    ),
}

FONT = "/System/Library/Fonts/HelveticaNeue.ttc"   # index 1 = Bold, 10 = Medium, 0 = Regular
MONO = "/System/Library/Fonts/SFNSMono.ttf"


def font(size, index=0, path=FONT):
    try:
        return ImageFont.truetype(path, size, index=index)
    except OSError:
        return ImageFont.load_default()


# ----------------------------------------------------------------------------
# Anatomy icons — drawn at 4x and downsampled for clean anti-aliased edges
# ----------------------------------------------------------------------------
def _canvas(size):
    s = size * 4
    return Image.new("RGBA", (s, s), (0, 0, 0, 0)), s


def icon_spine(size, colour):
    """Four stacked vertebrae with discs between them (matches the site icon)."""
    img, s = _canvas(size)
    d = ImageDraw.Draw(img)
    n = 4
    body_w, body_h = s * 0.42, s * 0.16
    disc_w, disc_h = s * 0.26, s * 0.045
    gap = s * 0.045
    total = n * body_h + (n - 1) * (disc_h + 2 * gap)
    y = (s - total) / 2
    cx = s / 2
    for i in range(n):
        d.rounded_rectangle((cx - body_w / 2, y, cx + body_w / 2, y + body_h), radius=body_h * 0.42, fill=colour)
        y += body_h
        if i < n - 1:
            y += gap
            d.rounded_rectangle((cx - disc_w / 2, y, cx + disc_w / 2, y + disc_h), radius=disc_h / 2, fill=colour)
            y += disc_h + gap
    return img.resize((size, size), Image.LANCZOS)


def icon_brain(size, colour):
    """Stylised brain: two lobes with a midline and gyri grooves."""
    img, s = _canvas(size)
    d = ImageDraw.Draw(img)
    # silhouette = union of ellipses
    cx, cy = s / 2, s * 0.5
    d.ellipse((s * 0.12, s * 0.20, s * 0.88, s * 0.82), fill=colour)          # main mass
    d.ellipse((s * 0.20, s * 0.13, s * 0.80, s * 0.55), fill=colour)          # top dome
    d.ellipse((s * 0.28, s * 0.55, s * 0.72, s * 0.88), fill=colour)          # temporal / cerebellum bulge
    # grooves in white
    w = int(s * 0.045)
    d.line((cx, s * 0.16, cx, s * 0.86), fill=WHITE, width=w)                 # midline
    for x0, y0, x1, y1, a0, a1 in [
        (s * 0.18, s * 0.28, s * 0.46, s * 0.50, 190, 330),
        (s * 0.24, s * 0.48, s * 0.48, s * 0.72, 160, 300),
        (s * 0.54, s * 0.28, s * 0.82, s * 0.50, 210, 350),
        (s * 0.52, s * 0.48, s * 0.76, s * 0.72, 240, 20),
    ]:
        d.arc((x0, y0, x1, y1), a0, a1, fill=WHITE, width=w)
    return img.resize((size, size), Image.LANCZOS)


ICONS = {"spine": icon_spine, "brain": icon_brain}


def centre_disc(name, size, colour):
    disc = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(disc).ellipse((0, 0, size - 1, size - 1), fill=WHITE)
    icon = ICONS[name](int(size * 0.8), colour)
    disc.alpha_composite(icon, ((size - icon.width) // 2, (size - icon.height) // 2))
    return disc


# ----------------------------------------------------------------------------
# QR code
# ----------------------------------------------------------------------------
def build_code(name, spec) -> Image.Image:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=40, border=2)
    qr.add_data(spec["url"])
    qr.make(fit=True)
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(radius_ratio=1.0),
        eye_drawer=RoundedModuleDrawer(radius_ratio=0.6),
        color_mask=RadialGradiantColorMask(back_color=WHITE, center_color=spec["centre"], edge_color=spec["edge"]),
    ).convert("RGBA")
    disc = centre_disc(name, int(img.width * 0.22), spec["centre"])
    img.alpha_composite(disc, ((img.width - disc.width) // 2, (img.height - disc.height) // 2))
    out = HERE / f"qr-{name}.png"
    img.convert("RGB").save(out, optimize=True)
    print(f"{out.name}: {img.width}px, version {qr.version}, {spec['url']}")
    return img


# ----------------------------------------------------------------------------
# A6 print card (105 x 148 mm at 300 dpi)
# ----------------------------------------------------------------------------
MM = 300 / 25.4


def text_w(d, txt, f):
    l, t, r, b = d.textbbox((0, 0), txt, font=f)
    return r - l


def wrap(d, txt, f, max_w):
    """Greedy word wrap to max_w pixels."""
    words, lines, cur = txt.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if text_w(d, trial, f) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def centred(d, W, y, txt, f, fill):
    d.text(((W - text_w(d, txt, f)) / 2, y), txt, font=f, fill=fill)


def build_card(name, spec, code: Image.Image):
    W, H = round(105 * MM), round(148 * MM)
    card = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(card)
    accent = spec["centre"]
    margin = round(8 * MM)

    # frame
    d.rounded_rectangle((margin * 0.55, margin * 0.55, W - margin * 0.55, H - margin * 0.55),
                        radius=round(6 * MM), outline=(216, 212, 226), width=round(0.4 * MM))

    y = margin + round(1 * MM)
    # icon badge
    badge = round(12 * MM)
    bx = (W - badge) // 2
    tint = tuple(round(c * 0.12 + 255 * 0.88) for c in accent)
    d.rounded_rectangle((bx, y, bx + badge, y + badge), radius=round(4 * MM), fill=tint)
    ic = ICONS[name](round(badge * 0.6), accent)
    card.paste(ic, (bx + (badge - ic.width) // 2, y + (badge - ic.height) // 2), ic)
    y += badge + round(3 * MM)

    # kicker
    f = font(round(3.0 * MM), 1)
    kick = " ".join(spec["kicker"])  # letter-spaced
    d.text(((W - text_w(d, kick, f)) / 2, y), kick, font=f, fill=accent)
    y += round(5.5 * MM)

    # title + subtitle
    f = font(round(7 * MM), 1)
    centred(d, W, y, spec["title"], f, INK)
    y += round(8.5 * MM)
    f = font(round(3.5 * MM), 10)
    centred(d, W, y, spec["subtitle"], f, INK_MUTED)
    y += round(6.5 * MM)

    # code
    qsize = round(54 * MM)
    q = code.convert("RGB").resize((qsize, qsize), Image.LANCZOS)
    card.paste(q, ((W - qsize) // 2, y))
    y += qsize + round(3 * MM)

    # instructions: first sentence bold, rest regular, wrapped to the card width
    text_w_max = W - 2 * margin - round(4 * MM)
    first, rest = spec["how"].split("\n", 1)
    fb, fr = font(round(3.0 * MM), 1), font(round(3.0 * MM), 0)
    for ln in wrap(d, first, fb, text_w_max):
        centred(d, W, y, ln, fb, INK); y += round(4.4 * MM)
    for ln in wrap(d, rest, fr, text_w_max):
        centred(d, W, y, ln, fr, INK_MUTED); y += round(4.4 * MM)
    y += round(1.5 * MM)
    f = font(round(2.4 * MM), 0, MONO)
    centred(d, W, y, spec["short_url"], f, INK_MUTED)

    # lock-up anchored at the bottom, short url just above it
    lockup = Image.open(ASSETS / "logos-color.png").convert("RGBA")
    lw = W - 2 * margin - round(6 * MM)
    lockup = lockup.resize((lw, round(lockup.height * lw / lockup.width)), Image.LANCZOS)
    ly = H - margin - lockup.height
    card.paste(lockup, ((W - lw) // 2, ly), lockup)
    sep = ly - round(4 * MM)
    d.line((margin, sep, W - margin, sep), fill=(230, 227, 238), width=round(0.3 * MM))
    assert y + round(4 * MM) < sep, f"{name}: card content overflows into the logo area"

    out = HERE / f"card-{name}.png"
    card.save(out, dpi=(300, 300), optimize=True)
    print(f"{out.name}: {W}x{H}px (A6 @ 300 dpi)")


if __name__ == "__main__":
    for name, spec in CODES.items():
        build_card(name, spec, build_code(name, spec))
