# Cuts the team's heads out of Kaszti's face sheet and turns them into paper cut-outs.
# Run: npm run faces  →  public/faces/m{1..4}_{closed,open}.png + src/faces.json (canvas sizes).
# The sheet holds 8 heads in two rows (4 people × mouth closed / open). Each head is separated from the
# kraft background with GrabCut, the open-mouth photo is aligned to the closed one on the eyes and
# forehead only (so the jaw can still drop), and both get the same hand-cut white paper border.
import json
import sys

import cv2
import numpy as np

SHEET, OUT, META = sys.argv[1], sys.argv[2], sys.argv[3]
im = cv2.imdecode(np.fromfile(SHEET, np.uint8), cv2.IMREAD_COLOR)
H, W = im.shape[:2]

# Generous boxes around each head on the 1024 × 1024 sheet (x0, y0, x1, y1), row-major.
BOXES = [(30, 110, 300, 470), (285, 110, 515, 470), (510, 110, 755, 470), (740, 110, 995, 470),
         (30, 545, 300, 905), (285, 545, 515, 905), (510, 545, 755, 905), (740, 545, 995, 905)]
# m1 Kaszti, m2 Viktor, m3 Bence, m4 Máté → (closed, open) sheet index.
PAIRS = [(4, 1), (0, 7), (6, 5), (3, 2)]
PAD = 40          # canvas margin around the head
BORDER = 7        # paper border width, px
PAPER = np.array([221, 235, 243], np.float32)  # #F3EBDD in BGR


def head_mask(i):
    x0, y0, x1, y1 = BOXES[i]
    mask = np.zeros((H, W), np.uint8)
    bgd, fgd = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(im, mask, (x0, y0, x1 - x0, y1 - y0), bgd, fgd, 6, cv2.GC_INIT_WITH_RECT)
    m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    m = np.where(lab == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
    flood = m.copy()
    cv2.floodFill(flood, np.zeros((H + 2, W + 2), np.uint8), (0, 0), 255)
    m |= cv2.bitwise_not(flood)
    # Smooth the cut line: no single-pixel teeth.
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    return (cv2.GaussianBlur(m, (0, 0), 1.2) > 127).astype(np.uint8) * 255


def on_canvas(i, rect):
    """Head i cut into a canvas covering `rect` (x, y, w, h) of the sheet."""
    x, y, w, h = rect
    m = head_mask(i)
    img = np.zeros((h, w, 3), np.uint8)
    msk = np.zeros((h, w), np.uint8)
    sx0, sy0, sx1, sy1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    img[sy0 - y:sy1 - y, sx0 - x:sx1 - x] = im[sy0:sy1, sx0:sx1]
    msk[sy0 - y:sy1 - y, sx0 - x:sx1 - x] = m[sy0:sy1, sx0:sx1]
    return img, msk


def bbox(m):
    ys, xs = np.nonzero(m)
    return xs.min(), ys.min(), xs.max(), ys.max()


def align(c_img, c_msk, o_img, o_msk):
    """Warp the open-mouth head onto the closed one: bbox init, then ECC on the upper face."""
    cx0, cy0, cx1, cy1 = bbox(c_msk)
    ox0, oy0, ox1, oy1 = bbox(o_msk)
    s = (cx1 - cx0) / (ox1 - ox0)
    warp = np.array([[s, 0, cx0 - s * ox0], [0, s, cy0 - s * oy0]], np.float32)
    upper = np.zeros_like(c_msk)
    upper[cy0 + int(0.12 * (cy1 - cy0)):cy0 + int(0.62 * (cy1 - cy0))] = 255
    upper &= cv2.erode(c_msk, np.ones((15, 15), np.uint8))
    g_c = cv2.cvtColor(c_img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    g_o = cv2.cvtColor(o_img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    try:
        crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6)
        _, warp = cv2.findTransformECC(g_c, g_o, cv2.invertAffineTransform(warp), cv2.MOTION_AFFINE, crit, upper, 5)
        warp = cv2.invertAffineTransform(warp)
    except cv2.error as e:
        print("  ECC failed, keeping the box alignment:", e)
    h, w = c_msk.shape
    o2 = cv2.warpAffine(o_img, warp, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    m2 = cv2.warpAffine(o_msk, warp, (w, h), flags=cv2.INTER_LINEAR)
    return o2, (m2 > 127).astype(np.uint8) * 255


def paper_head(img, face, outline, seed):
    """RGBA: face photo on a hand-cut white paper sticker (border follows `outline`)."""
    rng = np.random.default_rng(seed)
    h, w = face.shape
    dist = cv2.distanceTransform(cv2.bitwise_not(outline), cv2.DIST_L2, 5)
    wob = cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), 9)
    wob = wob / (np.abs(wob).max() + 1e-6) * 2.2
    a_paper = np.clip(BORDER + wob - dist + 0.5, 0, 1)
    a_face = cv2.GaussianBlur(face.astype(np.float32) / 255, (0, 0), 0.7)
    grain = cv2.GaussianBlur(rng.normal(0, 5, (h, w)).astype(np.float32), (0, 0), 0.8)[..., None]
    paper = np.clip(PAPER + grain, 0, 255)
    rgb = paper * (1 - a_face[..., None]) + img.astype(np.float32) * a_face[..., None]
    alpha = np.maximum(a_paper, a_face)
    return np.dstack([rgb, alpha * 255]).astype(np.uint8)


meta = {}
sheet = []
for n, (ci, oi) in enumerate(PAIRS, start=1):
    x0, y0, x1, y1 = bbox(head_mask(ci))
    rect = (x0 - PAD, y0 - PAD, x1 - x0 + 2 * PAD, y1 - y0 + 2 * PAD)
    c_img, c_msk = on_canvas(ci, rect)
    # The open head is cut from its own spot on the sheet, then aligned into the closed head's canvas.
    ox0, oy0, ox1, oy1 = bbox(head_mask(oi))
    o_img, o_msk = on_canvas(oi, (ox0 - PAD, oy0 - PAD, rect[2] + 80, rect[3] + 80))
    o_img = cv2.resize(o_img, None, fx=1, fy=1)
    # Same canvas size for ECC: crop / pad the open canvas to the closed one's size.
    oh, ow = c_msk.shape
    o_img, o_msk = o_img[:oh, :ow], o_msk[:oh, :ow]
    if o_img.shape[:2] != (oh, ow):
        o_img = cv2.copyMakeBorder(o_img, 0, oh - o_img.shape[0], 0, ow - o_img.shape[1], cv2.BORDER_REPLICATE)
        o_msk = cv2.copyMakeBorder(o_msk, 0, oh - o_msk.shape[0], 0, ow - o_msk.shape[1], cv2.BORDER_CONSTANT)
    o_img, o_msk = align(c_img, c_msk, o_img, o_msk)
    # No neck or collar: the open head ends just below the closed chin (room for the jaw to drop).
    _, top, _, chin = bbox(c_msk)
    o_msk[chin + int(0.035 * (chin - top)):] = 0
    o_msk = cv2.morphologyEx(o_msk, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    # One outline for both mouths, so the sticker never changes shape – only the face inside does.
    outline = c_msk | o_msk
    for state, img, msk in (("closed", c_img, c_msk), ("open", o_img, o_msk)):
        rgba = paper_head(img, msk, outline, seed=n)
        cv2.imwrite(f"{OUT}/m{n}_{state}.png", rgba)
        sheet.append(rgba)
    meta[f"m{n}"] = {"w": int(c_msk.shape[1]), "h": int(c_msk.shape[0])}
    print(f"m{n}: {c_msk.shape[1]}x{c_msk.shape[0]}")

with open(META, "w") as f:
    json.dump(meta, f)

# Review sheet: each member closed | open on kraft.
if len(sys.argv) > 4:
    tiles = []
    for t in sheet:
        bg = np.full((420, 300, 3), (122, 162, 200), np.float32)
        th, tw = t.shape[:2]
        k = min(280 / tw, 400 / th)
        t = cv2.resize(t, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
        th, tw = t.shape[:2]
        y, x = (420 - th) // 2, (300 - tw) // 2
        a = t[..., 3:4].astype(np.float32) / 255
        bg[y:y + th, x:x + tw] = bg[y:y + th, x:x + tw] * (1 - a) + t[..., :3] * a
        tiles.append(bg.astype(np.uint8))
    cv2.imwrite(sys.argv[4], np.vstack([np.hstack(tiles[:4]), np.hstack(tiles[4:])]))
