/* eslint-disable @typescript-eslint/no-unused-expressions --
   This file is deliberately a bare function expression: the Playwright MCP
   evaluates its whole contents as one, and supplies `page`. */
/**
 * audit.mjs — layout and correctness sweep across every page and breakpoint.
 *
 * Run via the Playwright MCP with { filename }, which evaluates this file as a
 * single function expression and supplies `page`. Everything is assertion, not
 * screenshotting: a screenshot confirms something rendered, not that it
 * rendered correctly.
 */
async (page) => {

  const PAGES = [
    '/',
    '/work',
    '/work/gdk',
    '/work/jack-jones-ibn-batuta-mall',
    '/studio',
    '/services',
    '/contact',
    '/does-not-exist',
  ];

  const BREAKPOINTS = [
    ['xs', 320, 640],
    ['phone', 390, 844],
    ['tablet', 768, 1024],
    ['laptop', 1280, 800],
    ['desktop', 1440, 900],
    ['wide', 1920, 1080],
  ];

  const HEADER_BAND = 72; // px of fixed header at the top of every page

  /** Everything that runs inside the page. Kept in one string-serialisable fn. */
  function collect(headerBand) {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const issues = [];

    const describe = (el) => {
      const cls = (el.className?.baseVal ?? el.className ?? '').toString().trim().slice(0, 48);
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 32);
      return `${el.tagName.toLowerCase()}${cls ? `.${cls.split(/\s+/)[0]}` : ''}${txt ? ` "${txt}"` : ''}`;
    };

    // Deliberately hidden from sight: screen-reader-only text is a clipped 1px
    // box, and the spam honeypot is parked far off-screen. Both would otherwise
    // dominate the report with findings that are the intended behaviour.
    const intentionallyHidden = (el) =>
      el.closest('.sr-only, [aria-hidden="true"]') !== null ||
      el.closest('[name="company_website"]') !== null ||
      (el.id === 'company-website' || el.closest('label[for="company-website"]') !== null) ||
      el.getBoundingClientRect().right < -1000;

    const visible = (el) => {
      if (intentionallyHidden(el)) return false;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      if (Number(cs.opacity) < 0.02) return false;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return false;
      // An ancestor can hide a subtree the element's own style knows nothing
      // about — the collapsed accordion is opacity:0 with a 0fr grid row, and
      // its list items still report real boxes.
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const pcs = getComputedStyle(p);
        if (pcs.display === 'none' || pcs.visibility === 'hidden') return false;
        if (Number(pcs.opacity) < 0.02) return false;
        if (p.clientHeight === 0 && /hidden|clip/.test(pcs.overflowY)) return false;
      }
      return true;
    };

    const all = [...document.querySelectorAll('body *')].filter(
      (el) => !el.closest('[data-nextjs-toast], nextjs-portal'),
    );

    // 1. Horizontal overflow of the document.
    if (document.documentElement.scrollWidth > vw + 1) {
      issues.push({
        kind: 'doc-overflow-x',
        detail: `scrollWidth ${document.documentElement.scrollWidth} > viewport ${vw}`,
      });
    }

    for (const el of all) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);

      // 2. Anything painted outside the viewport horizontally.
      if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
        // position:fixed decorations (the custom cursor) legitimately sit at the edge.
        if (cs.position !== 'fixed') {
          issues.push({
            kind: 'off-viewport-x',
            detail: `${describe(el)} spans ${Math.round(r.left)}..${Math.round(r.right)} (vw ${vw})`,
          });
        }
      }

      // 3. Content clipped by its own box — text cut off rather than wrapped.
      const clipsX = /hidden|clip/.test(cs.overflowX);
      const clipsY = /hidden|clip/.test(cs.overflowY);
      if (clipsX && el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
        // Same exemption as clipped-y below. A work card's thumbnail is an
        // object-cover image that scales to 105% on hover inside an
        // overflow-hidden frame: it overruns its box by ~9px mid-transition,
        // which is the effect working, not text being cut off. The magnetic
        // sweep above leaves a pointer on the page, so this fires at random.
        const hasText = el.innerText && el.innerText.trim().length > 0;
        if (hasText && !el.querySelector('canvas, img, video')) {
          issues.push({
            kind: 'clipped-x',
            detail: `${describe(el)} content ${el.scrollWidth} > box ${el.clientWidth}`,
          });
        }
      }
      if (clipsY && el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0) {
        // A canvas or an image cropped on purpose is fine; text being cut is not.
        const hasText = el.innerText && el.innerText.trim().length > 0;
        if (hasText && !el.querySelector('canvas, img, video')) {
          issues.push({
            kind: 'clipped-y',
            detail: `${describe(el)} content ${el.scrollHeight} > box ${el.clientHeight}`,
          });
        }
      }

      // 4. Text too small to read.
      const fs = parseFloat(cs.fontSize);
      const ownText = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 1,
      );
      if (ownText && fs > 0 && fs < 11 && cs.position !== 'absolute') {
        issues.push({ kind: 'tiny-text', detail: `${describe(el)} at ${fs}px` });
      }
    }

    // 5. Interactive elements hidden under the fixed header.
    const interactive = all.filter(
      (el) => visible(el) && el.matches('a, button, input, textarea, select, [tabindex]'),
    );
    for (const el of interactive) {
      if (el.closest('header')) continue;
      const r = el.getBoundingClientRect();
      // Only a real problem if it is also unclickable: the header is
      // pointer-events-none apart from its own controls, so content beneath it
      // usually still receives the tap.
      if (r.top < headerBand && r.bottom > 0 && r.bottom < headerBand + 4) {
        const hit = document.elementFromPoint(
          Math.round(Math.min(Math.max(r.left + r.width / 2, 1), vw - 1)),
          Math.round(Math.max(r.top + r.height / 2, 1)),
        );
        if (hit && !el.contains(hit) && hit !== el) {
          issues.push({
            kind: 'under-header-blocked',
            detail: `${describe(el)} top ${Math.round(r.top)} blocked by ${describe(hit)}`,
          });
        }
      }
    }

    // 6. Touch targets below the 44px guideline.
    for (const el of interactive) {
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) {
        issues.push({
          kind: 'small-target',
          detail: `${describe(el)} ${Math.round(r.width)}x${Math.round(r.height)}`,
        });
      }
    }

    // 7. Overlapping text blocks — two separate text runs sharing pixels.
    const textBlocks = all.filter((el) => {
      if (!visible(el)) return false;
      if (!el.matches('h1, h2, h3, p, li, dd, dt, span, a, button')) return false;
      if (el.querySelector('h1, h2, h3, p, li, dd, dt')) return false;
      const t = (el.innerText || '').trim();
      return t.length > 2;
    });
    for (let i = 0; i < textBlocks.length; i += 1) {
      for (let j = i + 1; j < textBlocks.length; j += 1) {
        const a = textBlocks[i];
        const b = textBlocks[j];
        if (a.contains(b) || b.contains(a)) continue;
        // A fixed header drawing over content is the point of a fixed header.
        if (Boolean(a.closest('header')) !== Boolean(b.closest('header'))) continue;
        // Cross-fading film chapters are stacked on purpose.
        if (a.closest('article') && b.closest('article') && a.closest('article') !== b.closest('article')) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (ox > 6 && oy > 6) {
          const area = ox * oy;
          const smaller = Math.min(ra.width * ra.height, rb.width * rb.height);
          if (smaller > 0 && area / smaller > 0.3) {
            issues.push({
              kind: 'text-overlap',
              detail: `${describe(a)} / ${describe(b)} overlap ${Math.round(ox)}x${Math.round(oy)}`,
            });
          }
        }
      }
    }

    // 8. Broken or unloaded images.
    for (const img of document.querySelectorAll('img')) {
      if (img.complete && img.naturalWidth === 0) {
        issues.push({ kind: 'broken-image', detail: img.currentSrc || img.src });
      }
    }

    // 9. Controls with no accessible name.
    for (const el of interactive) {
      // A form control is usually named by a <label>, not by its own content.
      const labelled = el.id
        ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
        : null;
      const name =
        (el.getAttribute('aria-label') || '').trim() ||
        (el.innerText || '').trim() ||
        (labelled?.textContent || '').trim() ||
        (el.closest('label')?.textContent || '').trim() ||
        (el.getAttribute('title') || '').trim() ||
        (el.querySelector('img')?.getAttribute('alt') || '').trim();
      if (!name) issues.push({ kind: 'unnamed-control', detail: describe(el) });
    }

    // 10. Painted text wider than the box that holds it.
    //
    //     scrollWidth/clientWidth does not catch this. An inline-block capped
    //     by max-width reports a box that fits while the glyphs themselves
    //     spill outside it — which is exactly how the footer email ran across
    //     the nav column beside it and passed every box-based check here.
    //     A Range over the text nodes measures what is actually painted.
    for (const el of all) {
      if (!visible(el)) continue;
      const hasOwnText = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 1,
      );
      if (!hasOwnText) continue;

      const range = document.createRange();
      range.selectNodeContents(el);
      const text = range.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      const spill = Math.round(text.right - box.right);
      // 2px of tolerance for italic overhang and subpixel rounding.
      if (spill > 2) {
        issues.push({
          kind: 'text-spills-box',
          detail: `${describe(el)} glyphs overrun its box by ${spill}px`,
        });
      }
    }

    // 10. Links that read identically but go somewhere different. WCAG 2.4.4:
    //     the purpose of a link has to be clear from its text. Two links both
    //     labelled "Instagram" pointing at different accounts shipped before
    //     this check existed.
    const byName = new Map();
    for (const el of interactive) {
      if (!el.matches('a[href]')) continue;
      const name = ((el.getAttribute('aria-label') || el.innerText || '').trim() || '')
        .replace(/\s+/g, ' ')
        .toLowerCase();
      if (!name) continue;
      const href = el.getAttribute('href');
      if (!byName.has(name)) byName.set(name, new Set());
      byName.get(name).add(href);
    }
    for (const [name, hrefs] of byName) {
      if (hrefs.size > 1) {
        issues.push({
          kind: 'ambiguous-link',
          detail: `"${name}" points to ${hrefs.size} different targets: ${[...hrefs].join(' | ')}`,
        });
      }
    }

    return { vw, vh, issues };
  }



  const report = {};

  for (const [bpName, w, h] of BREAKPOINTS) {
    await page.setViewportSize({ width: w, height: h });

    for (const path of PAGES) {
      const key = `${bpName} ${path}`;
      const consoleErrors = [];
      const onMsg = (m) => {
        if (m.type() !== 'error') return;
        const t = m.text();
        // The not-found route legitimately answers 404; that is not a defect.
        if (path === '/does-not-exist' && /404/.test(t)) return;
        consoleErrors.push(t.slice(0, 120));
      };
      page.on('console', onMsg);
      page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${String(e).slice(0, 120)}`));

      let status = 0;
      try {
        const resp = await page.goto(`http://localhost:3000${path}`, {
          waitUntil: 'load',
          timeout: 45000,
        });
        status = resp ? resp.status() : 0;
      } catch (err) {
        page.off('console', onMsg);
        report[key] = { status: 'NAV_FAIL', issues: [{ kind: 'nav', detail: String(err).slice(0, 100) }] };
        continue;
      }

      // The film needs its opening frames before layout settles.
      await page.waitForTimeout(path === '/' ? 6500 : 1600);

      // Magnetic controls only move once a pointer is near them, so a static
      // pass can never see them collide. Sweep a pointer across each group and
      // check that neighbours stay apart and that everything returns to rest.
      //
      // Pointer events are dispatched on an element, not on window: the custom
      // cursor's handler calls closest() on event.target, and a window target
      // throws before anything useful happens.
      const magnetic = await page.evaluate(async () => {
        const groups = new Map();
        for (const el of document.querySelectorAll('span.will-change-transform')) {
          const parent = el.parentElement;
          if (!parent) continue;
          if (!groups.has(parent)) groups.set(parent, []);
          groups.get(parent).push(el);
        }

        const found = [];
        for (const [, items] of groups) {
          if (items.length < 2) continue;
          const rest = items.map((s) => s.getBoundingClientRect());
          if (rest.some((r) => r.width === 0)) continue;

          const y = rest[0].top + rest[0].height / 2;
          let minGap = Infinity;
          const fire = (x) =>
            items[0].dispatchEvent(
              new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }),
            );

          for (let x = rest[0].left - 80; x <= rest[rest.length - 1].right + 80; x += 24) {
            fire(x);
            await new Promise((r) => setTimeout(r, 620));
            const now = items.map((s) => s.getBoundingClientRect());
            for (let i = 1; i < now.length; i += 1) {
              const a = now[i - 1];
              const b = now[i];
              // Only meaningful for siblings on the same row. These groups are
              // flex-wrap, so on a narrow viewport the buttons stack and the
              // horizontal "gap" between rows reads as a 200px+ overlap that
              // does not exist.
              const sameRow = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4;
              if (!sameRow) continue;
              minGap = Math.min(minGap, b.left - a.right);
            }
          }

          fire(-500);
          await new Promise((r) => setTimeout(r, 1400));
          const stuck = items.filter((s) => {
            const t = getComputedStyle(s).transform;
            return t !== 'none' && !/matrix\(1,\s*0,\s*0,\s*1,\s*0,\s*0\)/.test(t);
          }).length;

          found.push({
            labels: items.map((s) => s.textContent.trim().slice(0, 14)),
            minGap: Math.round(minGap * 10) / 10,
            stuck,
          });
        }
        return found;
      });

      const top = await page.evaluate(collect, HEADER_BAND);

      for (const g of magnetic) {
        if (Number.isFinite(g.minGap) && g.minGap < 0) {
          top.issues.push({
            kind: 'magnetic-overlap',
            detail: `${g.labels.join('/')} overlap by ${Math.abs(g.minGap)}px under pointer pull`,
          });
        }
        if (g.stuck > 0) {
          top.issues.push({
            kind: 'magnetic-stuck',
            detail: `${g.stuck} of ${g.labels.length} in ${g.labels.join('/')} never returned to rest`,
          });
        }
      }


      // Re-check partway down, where the sticky header meets real content.
      await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.55)));
      await page.waitForTimeout(1200);
      const mid = await page.evaluate(collect, HEADER_BAND);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      const bottom = await page.evaluate(collect, HEADER_BAND);

      // The mobile menu is the one surface scrolling never reaches, and it
      // shipped broken for exactly that reason: the overlay is position:fixed
      // inside a header carrying a transform, so `inset-0` resolved to the
      // 66px header band and the links painted above and below the black
      // ground. Checked here rather than through collect(), because the page
      // underneath stays in the document and every line of it would read as
      // overlapping the menu on top.
      // Back to the top first: the header retracts on a downward scroll and
      // the checks above leave the page at the bottom, so the toggle is parked
      // off-viewport and no click can land on it.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(900);

      let menuIssues = [];
      const toggle = page.getByRole('button', { name: 'Menu' });
      if (await toggle.isVisible().catch(() => false)) {
        await toggle.click();
        await page.waitForTimeout(800);
        menuIssues = await page.evaluate(() => {
          const found = [];
          const ov = document.getElementById('mobile-nav');
          if (!ov || ov.hidden) {
            return [{ kind: 'menu-did-not-open', detail: 'Menu clicked, overlay still hidden' }];
          }

          const r = ov.getBoundingClientRect();
          if (Math.round(window.innerHeight - r.height) > 2) {
            found.push({
              kind: 'menu-not-full-height',
              detail: `overlay ${Math.round(r.height)}px against a ${window.innerHeight}px viewport`,
            });
          }

          for (const a of ov.querySelectorAll('a')) {
            const lr = a.getBoundingClientRect();
            const label = (a.textContent || '').trim().slice(0, 20);
            if (lr.top < r.top - 1 || lr.bottom > r.bottom + 1) {
              found.push({
                kind: 'menu-link-outside',
                detail: `"${label}" at y ${Math.round(lr.top)} paints outside the overlay`,
              });
            }
            if (lr.height < 24 || lr.width < 24) {
              found.push({
                kind: 'menu-small-target',
                detail: `"${label}" ${Math.round(lr.width)}x${Math.round(lr.height)}`,
              });
            }
          }

          // The close control sits on the overlay but takes its colour from the
          // header's theme probe. If the probe does not re-run when the menu
          // opens, it stays ink-on-ink and the only way out is invisible.
          const header = document.querySelector('header');
          const toRgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
          const lum = (c) => {
            const v = toRgb(c);
            if (v.length < 3) return null;
            const [r0, g0, b0] = v.map((n) => {
              const x = n / 255;
              return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * r0 + 0.7152 * g0 + 0.0722 * b0;
          };
          const fg = lum(getComputedStyle(header).color);
          const bg = lum(getComputedStyle(ov).backgroundColor);
          if (fg !== null && bg !== null) {
            const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
            if (ratio < 3) {
              found.push({
                kind: 'menu-close-invisible',
                detail: `close control contrasts ${ratio.toFixed(2)}:1 against the overlay`,
              });
            }
          }

          return found;
        });
      }

      page.off('console', onMsg);

      const merged = new Map();
      for (const [where, snap] of [['top', top], ['mid', mid], ['bottom', bottom]]) {
        for (const iss of snap.issues) {
          const k = `${iss.kind}|${iss.detail}`;
          if (!merged.has(k)) merged.set(k, { ...iss, at: [] });
          merged.get(k).at.push(where);
        }
      }

      for (const iss of menuIssues) {
        const k = `${iss.kind}|${iss.detail}`;
        if (!merged.has(k)) merged.set(k, { ...iss, at: [] });
        merged.get(k).at.push('menu');
      }

      report[key] = {
        status,
        errors: [...new Set(consoleErrors)],
        issues: [...merged.values()],
      };
    }
  }

  // Client-side route transitions.
  //
  // Everything above arrives through page.goto, which is a fresh document every
  // time, so none of it ever exercised a React route change — and a crash on
  // leaving the home page shipped because of it. GSAP's `pin` wraps the film
  // section in a .pin-spacer, which quietly changes the section's real parent;
  // React still believes it is a child of <main>, and on unmount calls
  // main.removeChild(section), throws NotFoundError and takes the render down.
  // The browser then shows its own "this page couldn't load" screen and only a
  // reload recovers.
  const ROUTES = ['/', '/work', '/studio', '/services', '/contact'];
  const label = (r) => (r === '/' ? 'Home' : r.slice(1).replace(/^./, (c) => c.toUpperCase()));
  const transitions = [];

  await page.setViewportSize({ width: 1440, height: 900 });

  for (const start of ROUTES) {
    for (const target of ROUTES) {
      if (start === target) continue;

      const errs = [];
      const onErr = (e) => errs.push(String(e).slice(0, 120));
      page.on('pageerror', onErr);

      await page.goto(`http://localhost:3000${start}`, { waitUntil: 'load', timeout: 45000 });
      // The film has to be pinned before leaving it means anything.
      await page.waitForTimeout(start === '/' ? 6000 : 1500);

      let landed = null;
      try {
        await page
          .getByRole('navigation', { name: 'Primary' })
          .first()
          .getByRole('link', { name: label(target), exact: true })
          .click({ timeout: 8000 });
        await page.waitForTimeout(2500);
        // Not new URL(): the runner evaluates this file in a scope that has no
        // URL binding, which silently made every landing read as null and every
        // transition look like a failure.
        landed = page.url().replace('http://localhost:3000', '').split('?')[0] || '/';
      } catch (err) {
        errs.push(`could not follow the link: ${String(err).slice(0, 70)}`);
      }

      page.off('pageerror', onErr);

      const died = await page.evaluate(() =>
        /couldn.t load|Application error/i.test(document.body.innerText.slice(0, 80)),
      );
      // A pin that is not reverted leaves its spacer behind on the next page.
      const strayPins = await page.evaluate(() => document.querySelectorAll('.pin-spacer').length);

      const faults = [];
      if (died) faults.push('the render died');
      if (landed !== target) faults.push(`landed on ${landed}`);
      if (target !== '/' && strayPins > 0) faults.push(`${strayPins} pin-spacer left behind`);
      faults.push(...errs);

      if (faults.length > 0) {
        transitions.push({
          kind: 'route-transition',
          detail: `${start} -> ${target}: ${faults.join('; ')}`,
          at: ['nav'],
        });
      }
    }
  }

  if (transitions.length > 0) {
    report['client-side navigation'] = { status: 200, errors: [], issues: transitions };
  }

  // Collapse into a compact summary so the result stays readable.
  const summary = {};
  for (const [key, r] of Object.entries(report)) {
    const counts = {};
    for (const i of r.issues) counts[i.kind] = (counts[i.kind] || 0) + 1;
    if (r.errors?.length) counts.consoleError = r.errors.length;
    if (Object.keys(counts).length) summary[key] = counts;
  }

  return { summary, detail: report };
}
