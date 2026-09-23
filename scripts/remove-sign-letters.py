"""
Remove the stray HATTA sign letters that show through the living-room glass in
the desktop master (frames ~130-162), without regenerating the video.

The letters are near-white strokes on a darker mountainside. Inside a small
search box per frame range, pixels much brighter than the box's own median are
masked, grown by a couple of pixels, and filled with OpenCV inpainting from the
surrounding mountain. Only the letter pixels change, so window mullions and
glass inside the box are left alone.

  python scripts/remove-sign-letters.py assets/masters/desktop-hatta.mp4 \
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


def clean(frame, n):
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
    src, dst = sys.argv[1], sys.argv[2]
    preview = sys.argv[4] if len(sys.argv) > 4 and sys.argv[3] == '--preview' else None

    cap = cv2.VideoCapture(src)
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

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
        frame = clean(frame, n)
        enc.stdin.write(frame.tobytes())
        if preview and 128 <= n <= 166 and n % 2 == 0:
            tiles.append(frame[310:470, 60:380].copy())
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
