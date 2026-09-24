"""
Clean the desktop master without regenerating it:

1. The generator's sparkle watermark (bottom right, every frame). It never
   moves while the picture does, so averaging all frames shows its exact
   shape; that shape becomes a fixed mask, inpainted in every frame. Far
   smoother than a rectangular delogo, which left a visible pixel patch.

2. The stray HATTA sign letters that show through the living-room glass
   (frames ~130-162).

The letters are near-white strokes on a darker mountainside. Inside a small
search box per frame range, pixels much brighter than the box's own median are
masked, grown by a couple of pixels, and filled with OpenCV inpainting from the
surrounding mountain. Only the letter pixels change, so window mullions and
glass inside the box are left alone.

  python scripts/clean-desktop-master.py assets/masters/desktop-hatta.mp4 \
         assets/masters/desktop-hatta-clean.mp4 [--preview out.png]
"""
import subprocess
import sys

import cv2
import numpy as np

# (first frame, last frame, x, y, w, h) in source pixels.
BOXES = [
    (130, 145, 108, 358, 104, 74),  # "HAT" through the first pane
    (146, 163, 218, 346, 58, 72),   # the lone "A"
]

# How much brighter than the box median a pixel must be to count as sign.
LIFT = 38

# Search box around the watermark, and how far above its surroundings (in the
# all-frame average) a pixel must sit to belong to it.
WM_BOX = (1110, 550, 100, 96)
WM_LIFT = 7


def watermark_mask(src):
    """The sparkle's shape, from the per-pixel mean across every frame."""
    x, y, w, h = WM_BOX
    cap = cv2.VideoCapture(src)
    acc = np.zeros((h, w), np.float64)
    n = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        acc += cv2.cvtColor(frame[y:y + h, x:x + w], cv2.COLOR_BGR2GRAY)
        n += 1
    cap.release()
    mean = (acc / n).astype(np.uint8)
    lift = mean.astype(np.int16) - cv2.GaussianBlur(mean, (0, 0), 9).astype(np.int16)
    mask = (lift > WM_LIFT).astype(np.uint8) * 255
    # The blur is as wide as the sparkle's middle, so its centre barely
    # lifts; fill the outline solid or the centre survives as a dot.
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(mask, contours, -1, 255, cv2.FILLED)
    # Grow past the anti-aliased rim so no light halo survives.
    return cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))


# Neighbourhood used to line frames up with each other, around WM_BOX.
MATCH = (950, 400, 330, 320)
# Frames either side to search for an unobstructed view of the same surface.
REACH = 30
# Mean ring mismatch (0-255) above which a borrowed patch is not trusted.
MAX_ERR = 14


def neighbours(src, wm_mask):
    """Crops of MATCH per frame, plus a watermark-free grey copy for alignment."""
    mx, my, mw, mh = MATCH
    bx, by = WM_BOX[0] - mx, WM_BOX[1] - my
    local = np.zeros((mh, mw), np.uint8)
    local[by:by + wm_mask.shape[0], bx:bx + wm_mask.shape[1]] = wm_mask
    window = cv2.createHanningWindow((mw, mh), cv2.CV_32F)

    crops, greys = [], []
    cap = cv2.VideoCapture(src)
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        crop = frame[my:my + mh, mx:mx + mw].copy()
        grey = cv2.inpaint(cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY), local, 5, cv2.INPAINT_TELEA)
        crops.append(crop)
        greys.append(grey.astype(np.float32) * window)
    cap.release()
    return crops, greys


def borrow(n, crops, greys, wm_mask):
    """
    The surface under the watermark in frame n, taken from a nearby frame
    where the camera has moved it clear of the watermark.

    Each candidate frame is aligned to frame n by phase correlation, and
    scored on the ring of pixels just outside the watermark, which both
    frames can see. Returns (error, patch) for the best, or None.
    """
    mx, my, mw, mh = MATCH
    bx, by = WM_BOX[0] - mx, WM_BOX[1] - my
    h, w = wm_mask.shape
    inside = wm_mask > 0
    ring = (cv2.dilate(wm_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))) > 0) & ~inside
    here = crops[n][by:by + h, bx:bx + w].astype(np.float32)

    def score(m, ix, iy):
        if ix < 0 or iy < 0 or ix + w > mw or iy + h > mh:
            return None
        # The borrowed area must not itself sit under the watermark.
        ox, oy = ix - bx, iy - by
        if abs(ox) < w and abs(oy) < h:
            shifted = np.zeros_like(inside)
            shifted[max(0, oy):h + min(0, oy), max(0, ox):w + min(0, ox)] =                 inside[max(0, -oy):h - max(0, oy), max(0, -ox):w - max(0, ox)]
            if (shifted & inside).any():
                return None
        patch = crops[m][iy:iy + h, ix:ix + w].astype(np.float32)
        return float(np.abs(patch[ring] - here[ring]).mean()), m, ix, iy

    candidates = []
    for k in range(-REACH, REACH + 1):
        m = n + k
        if k == 0 or not 0 <= m < len(crops):
            continue
        (dx, dy), _ = cv2.phaseCorrelate(greys[n], greys[m])
        for sx, sy in ((dx, dy), (-dx, -dy)):
            hit = score(m, int(round(bx + sx)), int(round(by + sy)))
            if hit:
                candidates.append(hit)
    if not candidates:
        return None

    # A global shift is a few pixels off where the camera is also moving
    # forward; refine the most promising candidates with a local search.
    best = min(candidates)
    for _, m, ix, iy in sorted(candidates)[:5]:
        for ddy in range(-4, 5):
            for ddx in range(-4, 5):
                hit = score(m, ix + ddx, iy + ddy)
                if hit and hit < best:
                    best = hit

    err, m, ix, iy = best
    patch = crops[m][iy:iy + h, ix:ix + w].astype(np.float32)
    # Match exposure: the two frames can differ slightly in grade.
    patch += here[ring].mean(0) - patch[ring].mean(0)
    # Busy texture (rock, foliage) mismatches more even when the patch is
    # right, and hides a small mismatch better than a blur; loosen the limit.
    return err / max(1.0, here[ring].std() / 18), patch


def clean(frame, n, wm_mask, crops, greys):
    x, y, w, h = WM_BOX
    roi = frame[y:y + h, x:x + w]
    found = borrow(n, crops, greys, wm_mask)
    if found and found[0] < MAX_ERR:
        filled = np.clip(found[1], 0, 255)
    else:
        # No clean view nearby: inpaint, softened so it reads as
        # out-of-focus surface rather than a smear.
        filled = cv2.GaussianBlur(cv2.inpaint(roi, wm_mask, 5, cv2.INPAINT_TELEA), (0, 0), 2.5)
    # Feather the edge so the fill has no border.
    alpha = cv2.GaussianBlur(wm_mask, (0, 0), 2)[..., None].astype(np.float32) / 255
    frame[y:y + h, x:x + w] = (filled * alpha + roi * (1 - alpha)).astype(np.uint8)

    for first, last, x, y, w, h in BOXES:
        if not first <= n <= last:
            continue
        roi = frame[y:y + h, x:x + w]
        lum = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY).astype(np.int16)
        sat = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)[:, :, 1]
        mask = ((lum > np.median(lum) + LIFT) & (sat < 90)).astype(np.uint8) * 255
        mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))
        frame[y:y + h, x:x + w] = cv2.inpaint(roi, mask, 6, cv2.INPAINT_TELEA)
    return frame


def main():
    global WM_BOX, MATCH, BOXES
    src, dst, *rest = sys.argv[1:]
    opts = dict(zip(rest[::2], rest[1::2]))
    preview = opts.get('--preview')
    if '--wm' in opts:
        WM_BOX = tuple(int(v) for v in opts['--wm'].split(','))
        BOXES = []

    cap = cv2.VideoCapture(src)
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    if '--wm' in opts:
        # Alignment neighbourhood: the watermark box grown 150px, inside the frame.
        x, y, bw, bh = WM_BOX
        x0, y0 = max(0, x - 150), max(0, y - 150)
        MATCH = (x0, y0, min(w, x + bw + 150) - x0, min(h, y + bh + 150) - y0)

    wm_mask = watermark_mask(src)
    crops, greys = neighbours(src, wm_mask)

    # Near-lossless so the film build re-encodes from clean pixels.
    enc = subprocess.Popen([
        'ffmpeg', '-v', 'error', '-y',
        '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{w}x{h}', '-r', str(fps), '-i', '-',
        '-c:v', 'libx264', '-crf', '8', '-preset', 'slow', '-pix_fmt', 'yuv420p', dst,
    ], stdin=subprocess.PIPE)

    tiles = []
    n = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frame = clean(frame, n, wm_mask, crops, greys)
        enc.stdin.write(frame.tobytes())
        if preview and n % 20 == 0:
            x, y, bw, bh = WM_BOX
            tiles.append(cv2.resize(frame[max(0, y - 60):y + bh + 60, max(0, x - 60):x + bw + 60], None, fx=2, fy=2))
        n += 1

    enc.stdin.close()
    enc.wait()
    cap.release()

    if preview:
        rows = [np.hstack(tiles[i:i + 4]) for i in range(0, len(tiles) - len(tiles) % 4, 4)]
        cv2.imwrite(preview, np.vstack(rows))
    print(f'{n} frames -> {dst}')


if __name__ == '__main__':
    main()
