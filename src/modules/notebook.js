import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { esc } from './theme.js';

/*
 * Book model
 * ──────────
 * pages = [cover, intro, contents, w1-info, w1-media, …, wN-info, wN-media, outro]
 * Each "leaf" is one sheet of paper: front = pages[2k] (a right page),
 * back = pages[2k+1] (the next left page). Flipping leaf k turns it
 * -180° around the spine.
 *
 * state 0         → closed, cover visible (book shifted so the cover is centred)
 * state n         → n leaves flipped
 * state = leaves  → last spread: outro + inside back cover
 */

const pad = (n) => String(n).padStart(2, '0');

/* ── Page templates ─────────────────────────────────────── */
const coverPage = (c) => `
  <div class="page page--cover">
    <div class="cover__tape"></div>
    <p class="cover__year">${esc(c.year)}</p>
    <h2 class="cover__title">${esc(c.title)}</h2>
    <p class="cover__sub">${esc(c.subtitle)}</p>
    <p class="cover__hint">${esc(c.hint)}</p>
  </div>`;

const introPage = (n) => `
  <div class="page page--paper page--left">
    <p class="hand hand--lg">${esc(n.intro.heading)}</p>
    ${n.intro.body.map((b) => `<p class="serif">${esc(b)}</p>`).join('')}
    <p class="hand hand--sign">— ${esc(n.intro.signature)}</p>
  </div>`;

const contentsPage = (n) => `
  <div class="page page--paper page--right">
    <p class="label">${esc(n.indexTitle)}</p>
    <ol class="toc">
      ${n.works
        .map(
          (w, i) => `
        <li><button class="toc__item" data-goto="${i + 2}">
          <span class="toc__num">${pad(i + 1)}</span>
          <span class="toc__title">${esc(w.title)}</span>
          <span class="toc__cat">${esc(w.category)}</span>
        </button></li>`,
        )
        .join('')}
    </ol>
    <p class="hand hand--note">tap a title ↗</p>
  </div>`;

const workInfoPage = (w, i, total) => `
  <div class="page page--paper page--left">
    <p class="label">${pad(i + 1)} / ${pad(total)}</p>
    <h3 class="work__title">${esc(w.title)}</h3>
    <p class="work__cat">${esc(w.category)}</p>
    <dl class="work__meta">
      <div><dt>Client</dt><dd>${esc(w.client)}</dd></div>
      <div><dt>Year</dt><dd>${esc(w.year)}</dd></div>
      <div><dt>Role</dt><dd>${esc(w.role)}</dd></div>
      ${w.stat ? `<div><dt>Result</dt><dd>${esc(w.stat)}</dd></div>` : ''}
    </dl>
    <p class="serif work__desc">${esc(w.description)}</p>
    ${w.note ? `<p class="hand hand--note">${esc(w.note)}</p>` : ''}
  </div>`;

const workMediaPage = (w) => `
  <div class="page page--dark page--right">
    <figure class="polaroid ${w.video ? 'has-video' : ''}" ${w.video ? `data-video="${esc(w.video)}"` : ''}>
      <span class="tape tape--tl"></span><span class="tape tape--br"></span>
      <img src="${esc(w.thumbnail)}" alt="${esc(w.title)}" loading="eager" draggable="false" />
      ${w.video ? '<span class="polaroid__play" aria-label="Play">▶</span>' : ''}
    </figure>
    <p class="media__caption"><span class="hand">${esc(w.title)}</span> <span class="serif">${esc(w.year)}</span></p>
  </div>`;

const outroPage = (n) => `
  <div class="page page--paper page--left">
    <p class="hand hand--lg">${esc(n.outro.heading)}</p>
    <p class="serif">${esc(n.outro.body)}</p>
    <a class="outro__cta" href="${esc(n.outro.cta.href)}">${esc(n.outro.cta.label)}</a>
  </div>`;

/* ── Render ─────────────────────────────────────────────── */
export function renderNotebook(n) {
  const pages = [coverPage(n.cover), introPage(n), contentsPage(n)];
  n.works.forEach((w, i) => pages.push(workInfoPage(w, i, n.works.length), workMediaPage(w)));
  pages.push(outroPage(n));

  const leaves = [];
  for (let k = 0; k < pages.length; k += 2) {
    leaves.push(`
      <div class="leaf" data-leaf="${k / 2}">
        <div class="leaf__face leaf__face--front">${pages[k]}<span class="shade"></span></div>
        <div class="leaf__face leaf__face--back">${pages[k + 1] || ''}<span class="shade"></span></div>
      </div>`);
  }

  return `
  <section class="notebook" id="portfolio">
    <button class="nb-arrow nb-arrow--prev" aria-label="Previous page">
      <svg viewBox="0 0 48 52" width="48" height="52"><path d="M46 2 L2 26 L46 50 Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    </button>

    <div class="book-stage">
      <div class="book" data-state="0">
        <div class="book__board book__board--left"></div>
        <div class="book__board book__board--right">
          <div class="page page--board"><p class="hand">fin.</p></div>
        </div>
        ${leaves.join('')}
        <div class="book__spine"></div>
      </div>
    </div>

    <button class="nb-arrow nb-arrow--next" aria-label="Next page">
      <svg viewBox="0 0 48 52" width="48" height="52"><path d="M2 2 L46 26 L2 50 Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    </button>

    <p class="nb-counter"><span class="nb-counter__cur">00</span> / <span class="nb-counter__total">00</span></p>
  </section>`;
}

/* ── Behaviour ──────────────────────────────────────────── */
export function initNotebook() {
  const section = document.querySelector('.notebook');
  const book = section.querySelector('.book');
  const leaves = [...book.querySelectorAll('.leaf')];
  const max = leaves.length;
  const cur = section.querySelector('.nb-counter__cur');
  const total = section.querySelector('.nb-counter__total');

  let state = 0;
  const tweens = new Map();

  /*
   * Inside preserve-3d, z-index is ignored – paint order follows 3D depth.
   * So each leaf gets a tiny translateZ: unflipped leaves stack first-on-top,
   * flipped leaves stack last-on-top, and a turning leaf lifts off the pile.
   */
  const GAP = 0.6; // px between sheets
  const setLeaf = (i, p) => {
    const leaf = leaves[i];
    const lift = Math.sin(p * Math.PI);
    const zRight = (max - i) * GAP;
    const zLeft = (i + 1) * GAP;
    gsap.set(leaf, {
      rotationY: -180 * p,
      z: zRight + (zLeft - zRight) * p + lift * 60,
      // a tiny skew sells the paper "bend" during the turn
      skewY: (p < 0.5 ? -1 : 1) * lift * 1.5,
    });
    leaf.dataset.p = p;
    leaf.style.setProperty('--shade-front', (p * 0.55).toFixed(3));
    leaf.style.setProperty('--shade-back', ((1 - p) * 0.55).toFixed(3));
    leaf.style.setProperty('--lift', lift.toFixed(3));
  };
  leaves.forEach((_, i) => setLeaf(i, 0));

  const turn = (i, toFlipped, delay = 0) => {
    tweens.get(i)?.kill();
    const obj = { p: Number(leaves[i].dataset.p) };
    tweens.set(
      i,
      gsap.to(obj, {
        p: toFlipped ? 1 : 0,
        duration: 1.15,
        delay,
        ease: 'power2.inOut',
        onUpdate: () => setLeaf(i, obj.p),
        onComplete: () => tweens.delete(i),
      }),
    );
  };

  /*
   * Mobile (< 768px): the book is rendered at two screen-widths and slides so
   * ONE page fills the screen. "side" says which page of the spread is shown.
   * next: left page → slide to right page → turn the leaf (lands on the new
   * left page, which slides into view at the same time).
   */
  const mq = window.matchMedia('(max-width: 767px)');
  let side = 'R'; // cover is a right-hand page

  const positionBook = () => {
    let shift;
    if (mq.matches) shift = side === 'L' ? 25 : -25;
    else shift = state === 0 ? -25 : 0; // closed: cover centred; open: spread centred
    gsap.to(book, { xPercent: shift, duration: 1.1, ease: 'power3.inOut' });
    book.dataset.state = state;
    // Only the two visible top sheets take clicks (3D hit-testing is unreliable)
    leaves.forEach((l, i) => (l.style.pointerEvents = i === state || i === state - 1 ? 'auto' : 'none'));
    section.classList.toggle('is-open', state > 0);

    const atEnd = mq.matches ? state === max && side === 'R' : state === max;
    section.querySelector('.nb-arrow--prev').disabled = state === 0;
    section.querySelector('.nb-arrow--next').disabled = atEnd;
    // Counter: spreads on desktop, single pages on mobile
    if (mq.matches) {
      cur.textContent = pad(side === 'L' ? state * 2 - 1 : state * 2);
      total.textContent = pad(max * 2);
    } else {
      cur.textContent = pad(state);
      total.textContent = pad(max);
    }
  };

  const goTo = (target, landOn = 'L') => {
    target = Math.max(0, Math.min(max, target));
    if (target === 0) landOn = 'R';
    if (target === state) {
      if (side !== landOn) {
        side = landOn;
        positionBook();
      }
      return;
    }
    const dir = target > state ? 1 : -1;
    let d = 0;
    for (let s = state; s !== target; s += dir) {
      const idx = dir > 0 ? s : s - 1;
      turn(idx, dir > 0, d);
      d += 0.12; // multi-page jumps riffle through
    }
    state = target;
    side = landOn;
    positionBook();
  };

  const next = () => {
    if (!mq.matches) return goTo(state + 1);
    if (side === 'L') goTo(state, 'R');
    else if (state < max) goTo(state + 1, 'L');
  };
  const prev = () => {
    if (!mq.matches) return goTo(state - 1);
    if (side === 'R' && state > 0) goTo(state, 'L');
    else if (side === 'L') goTo(state - 1, 'R');
  };

  mq.addEventListener('change', () => {
    if (state === 0) side = 'R';
    positionBook();
  });
  positionBook();

  section.querySelector('.nb-arrow--next').addEventListener('click', next);
  section.querySelector('.nb-arrow--prev').addEventListener('click', prev);

  // Click a page: right half → next, left half → prev (ignore interactive bits)
  book.addEventListener('click', (e) => {
    const toc = e.target.closest('[data-goto]');
    if (toc) return goTo(Number(toc.dataset.goto), 'L');
    if (e.target.closest('a, button, .polaroid')) return;
    let mid;
    if (mq.matches) mid = window.innerWidth / 2;
    else {
      const r = book.getBoundingClientRect();
      mid = state === 0 ? r.left : r.left + r.width / 2;
    }
    if (e.clientX > mid) next();
    else prev();
  });

  // Keyboard when the section is on screen
  let inView = false;
  ScrollTrigger.create({
    trigger: section,
    start: 'top 60%',
    end: 'bottom 40%',
    onToggle: (self) => (inView = self.isActive),
  });
  window.addEventListener('keydown', (e) => {
    if (!inView || document.body.classList.contains('lightbox-open')) return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Swipe
  let sx = null;
  book.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
  book.addEventListener('touchend', (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    sx = null;
  });

  // Hover tilt on the whole book (subtle, like a notebook on a desk)
  const stage = section.querySelector('.book-stage');
  const tilt = { rx: 0, ry: 0 };
  section.addEventListener('pointermove', (e) => {
    const r = section.getBoundingClientRect();
    tilt.ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
    tilt.rx = -((e.clientY - r.top) / r.height - 0.5) * 5;
    gsap.to(stage, { rotationY: tilt.ry, rotationX: 8 + tilt.rx, duration: 1.2, ease: 'power3.out' });
  });
  section.addEventListener('pointerleave', () =>
    gsap.to(stage, { rotationY: 0, rotationX: 8, duration: 1.2, ease: 'power3.out' }),
  );

  // Entrance: book slides up from below and settles onto the "desk"
  gsap.set(stage, { rotationX: 8 });
  gsap
    .timeline({ scrollTrigger: { trigger: section, start: 'top 75%', once: true } })
    .from(stage, { yPercent: 35, rotationX: 40, rotationZ: -6, autoAlpha: 0, duration: 1.6, ease: 'power4.out' })
    .from(section.querySelectorAll('.nb-arrow, .nb-counter'), { autoAlpha: 0, x: 0, duration: 1, stagger: 0.1 }, 0.6);
}
