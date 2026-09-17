#!/usr/bin/env python3
"""
Generate the printable, branded QR codes for the 3D MI Reports demos.

    python3 -m venv .venv && .venv/bin/pip install "qrcode[pil]"
    .venv/bin/python assets/qr/make_qr.py

Each code uses error-correction level H (30 % redundancy) so the group mark
in the centre does not break scanning; keep the logo under ~20 % of the area.
"""
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import RadialGradiantColorMask
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent
BASE = "https://bimcv-csusp.github.io/3D-MI-Reports/"

CODES = {
    # name        url                                    centre colour  edge colour
    "spine": (BASE + "spine-visualization/?lang=es", (56, 112, 224), (24, 0, 64)),
    "brain": (BASE + "brain-visualization/?lang=es", (124, 77, 255), (24, 0, 64)),
}


def group_mark(size: int) -> Image.Image:
    """Crop the 'i2' symbol from the colour lock-up and put it on a white disc."""
    lockup = Image.open(ASSETS / "logos-color.png").convert("RGBA")
    w, h = lockup.size
    # the symbol sits between ~63.5 % and ~72.5 % of the lock-up width
    mark = lockup.crop((int(w * 0.635), 0, int(w * 0.725), h))
    mark = mark.crop(mark.getbbox())
    # fit inside a white disc with generous padding
    disc = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(disc).ellipse((0, 0, size - 1, size - 1), fill=(255, 255, 255, 255))
    inner = int(size * 0.66)
    k = inner / max(mark.width, mark.height)          # scale up or down to fit
    mark = mark.resize((round(mark.width * k), round(mark.height * k)), Image.LANCZOS)
    disc.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    return disc


def build(name: str, url: str, centre, edge) -> Path:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=40, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(radius_ratio=1.0),
        eye_drawer=RoundedModuleDrawer(radius_ratio=0.6),
        color_mask=RadialGradiantColorMask(back_color=(255, 255, 255), center_color=centre, edge_color=edge),
    ).convert("RGBA")
    # centre mark (≈ 22 % of the code width, well within level-H tolerance)
    mark = group_mark(int(img.width * 0.22))
    img.alpha_composite(mark, ((img.width - mark.width) // 2, (img.height - mark.height) // 2))
    out = HERE / f"qr-{name}.png"
    img.convert("RGB").save(out, optimize=True)
    print(f"{out.name}: {img.width}px, version {qr.version}, {url}")
    return out


if __name__ == "__main__":
    for name, (url, centre, edge) in CODES.items():
        build(name, url, centre, edge)
