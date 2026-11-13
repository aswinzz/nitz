import { gsap } from 'gsap';
import { esc } from './theme.js';

/*
 * Joke balls for the contact section.
 * Tiny 2D physics: they drift around, bounce off the section walls, each
 * other and the contact card, lean as they move, squash on impact, and can
 * be dragged and thrown.
 */

export function renderBalls(balls = []) {
  return `
  <div class="balls" aria-hidden="true">
    ${balls
      .map(
        (b) => `
      <div class="ball" style="--ball-bg:${esc(b.bg || '#000')};--ball-ink:${esc(b.ink || '#fff')}">
        <span class="ball__face"><span class="ball__text">${esc(b.text)}</span></span>
      </div>`,
      )
      .join('')}
  </div>`;
}

const CRUISE = 1.6; // px per frame (at 60fps) the balls settle back to
const MAX = 28;

export function initBalls(section) {
  const els = [...section.querySelectorAll('.ball')];
  if (!els.length) return;

  const card = section.querySelector('.contact__card');
  const footer = section.querySelector('.footer');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0;
  let H = 0;
  const balls = els.map((el) => ({ el, face: el.firstElementChild, x: 0, y: 0, vx: 0, vy: 0, r: 0, a: 0, drag: null }));

  const sizeBalls = () => {
    W = section.clientWidth;
    H = footer.offsetTop; // keep the footer clear
    const r = Math.min(88, Math.max(48, W * 0.058));
    balls.forEach((b) => {
      b.r = r;
      b.el.style.setProperty('--r', `${r}px`);
    });
  };

  const cardRect = () => {
    const s = section.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    return { l: c.left - s.left, t: c.top - s.top, r: c.right - s.left, b: c.bottom - s.top };
  };

  const hitsCard = (x, y, r, c) => {
    const cx = Math.max(c.l, Math.min(x, c.r));
    const cy = Math.max(c.t, Math.min(y, c.b));
    return (x - cx) ** 2 + (y - cy) ** 2 < r * r;
  };

  const scatter = () => {
    const c = cardRect();
    balls.forEach((b, i) => {
      for (let tries = 0; tries < 200; tries++) {
        b.x = b.r + Math.random() * (W - 2 * b.r);
        b.y = b.r + Math.random() * (H - 2 * b.r);
        const clear =
          !hitsCard(b.x, b.y, b.r + 10, c) &&
          balls.slice(0, i).every((o) => Math.hypot(o.x - b.x, o.y - b.y) > b.r + o.r + 10);
        if (clear) break;
      }
      const ang = Math.random() * Math.PI * 2;
      b.vx = Math.cos(ang) * CRUISE * 1.5;
      b.vy = Math.sin(ang) * CRUISE * 1.5;
      b.a = Math.random() * 40 - 20;
    });
  };

  const squash = (b, nx, ny) => {
    const ang = (Math.atan2(ny, nx) * 180) / Math.PI;
    gsap.fromTo(
      b.face,
      { '--sq': 0.82, '--sq-a': `${ang}deg` },
      { '--sq': 1, duration: 0.6, ease: 'elastic.out(1, 0.35)', overwrite: true },
    );
  };

  const render = () => {
    balls.forEach((b) => {
      b.el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`;
      b.face.style.setProperty('--spin', `${b.a}deg`);
    });
  };

  const step = (_t, _dt, frame) => {
    if (!running) return;
    const k = Math.min(3, gsap.ticker.deltaRatio(60));
    const c = cardRect();

    for (const b of balls) {
      if (b.drag) continue;

      // ease back toward a lazy cruising speed
      const sp = Math.hypot(b.vx, b.vy) || 0.001;
      const target = sp > CRUISE ? sp * 0.985 + CRUISE * 0.015 : sp + 0.05;
      const s = Math.min(MAX, target) / sp;
      b.vx *= s;
      b.vy *= s;

      b.x += b.vx * k;
      b.y += b.vy * k;
      // lean into the direction of travel (keeps the joke readable)
      const lean = Math.max(-35, Math.min(35, b.vx * 7));
      b.a += (lean - b.a) * 0.06 * k;

      // walls
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); if (sp > 4) squash(b, 1, 0); }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx); if (sp > 4) squash(b, -1, 0); }
      if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy); if (sp > 4) squash(b, 0, 1); }
      if (b.y > H - b.r) { b.y = H - b.r; b.vy = -Math.abs(b.vy); if (sp > 4) squash(b, 0, -1); }

      // card (circle vs rectangle)
      const px = Math.max(c.l, Math.min(b.x, c.r));
      const py = Math.max(c.t, Math.min(b.y, c.b));
      let dx = b.x - px;
      let dy = b.y - py;
      let d = Math.hypot(dx, dy);
      if (d < b.r) {
        if (d === 0) { dx = 0; dy = b.y < (c.t + c.b) / 2 ? -1 : 1; d = 1; } // centre inside card
        const nx = dx / d;
        const ny = dy / d;
        b.x = px + nx * b.r;
        b.y = py + ny * b.r;
        const vn = b.vx * nx + b.vy * ny;
        if (vn < 0) {
          b.vx -= 2 * vn * nx;
          b.vy -= 2 * vn * ny;
          if (Math.abs(vn) > 3) squash(b, nx, ny);
        }
      }
    }

    // ball vs ball (equal mass, elastic)
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i];
        const b = balls[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const min = a.r + b.r;
        if (d > 0 && d < min) {
          const nx = dx / d;
          const ny = dy / d;
          const push = (min - d) / 2;
          if (!a.drag) { a.x -= nx * push; a.y -= ny * push; }
          if (!b.drag) { b.x += nx * push; b.y += ny * push; }
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) {
            if (!a.drag) { a.vx += rel * nx; a.vy += rel * ny; }
            if (!b.drag) { b.vx -= rel * nx; b.vy -= rel * ny; }
            if (Math.abs(rel) > 3) { squash(a, -nx, -ny); squash(b, nx, ny); }
          }
        }
      }
    }
    render();
  };

  /* ── drag & throw ─────────────────────────────────────── */
  balls.forEach((b) => {
    b.el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      b.el.setPointerCapture(e.pointerId);
      b.el.classList.add('is-grabbed');
      const s = section.getBoundingClientRect();
      b.drag = { ox: e.clientX - s.left - b.x, oy: e.clientY - s.top - b.y, lx: e.clientX, ly: e.clientY, lt: performance.now() };
      b.vx = b.vy = 0;
    });
    b.el.addEventListener('pointermove', (e) => {
      if (!b.drag) return;
      const s = section.getBoundingClientRect();
      const now = performance.now();
      const dt = Math.max(8, now - b.drag.lt);
      // velocity in px per 60fps-frame, for the throw
      b.vx = ((e.clientX - b.drag.lx) / dt) * 16.7;
      b.vy = ((e.clientY - b.drag.ly) / dt) * 16.7;
      b.drag.lx = e.clientX;
      b.drag.ly = e.clientY;
      b.drag.lt = now;
      b.x = Math.max(b.r, Math.min(W - b.r, e.clientX - s.left - b.drag.ox));
      b.y = Math.max(b.r, Math.min(H - b.r, e.clientY - s.top - b.drag.oy));
      b.a = Math.max(-35, Math.min(35, b.vx * 4));
      if (reduce) render();
    });
    const release = () => {
      if (!b.drag) return;
      b.drag = null;
      b.el.classList.remove('is-grabbed');
      b.vx = Math.max(-MAX, Math.min(MAX, b.vx));
      b.vy = Math.max(-MAX, Math.min(MAX, b.vy));
    };
    b.el.addEventListener('pointerup', release);
    b.el.addEventListener('pointercancel', release);
  });

  /* ── run only while visible ───────────────────────────── */
  let running = false;
  sizeBalls();
  scatter();
  render();

  if (reduce) return; // static balls, still draggable

  gsap.ticker.add(step);
  new IntersectionObserver(([entry]) => (running = entry.isIntersecting)).observe(section);

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      sizeBalls();
      balls.forEach((b) => {
        b.x = Math.min(Math.max(b.x, b.r), W - b.r);
        b.y = Math.min(Math.max(b.y, b.r), H - b.r);
      });
    }, 150);
  });
}
