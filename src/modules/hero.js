import { gsap } from 'gsap';
import { esc } from './theme.js';
import { renderSlot, initSlot } from './slot.js';

let cfgRef;
let slot;
const circle = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0 };

export function renderHero(cfg) {
  const words = cfg.bio
    .split(/\s+/)
    .map((w) => `<span class="mask"><span class="mask__in">${esc(w)}</span></span>`)
    .join(' ');

  return `
  <section class="hero" id="home">
    <canvas class="hero__reveal" aria-hidden="true"></canvas>
    <div class="hero__content">
      <h1 class="hero__title" aria-label="${esc(cfg.title)}">
        <span class="hero__typed"></span><span class="hero__cursor" aria-hidden="true">|</span>
      </h1>
      <p class="hero__bio">${words}</p>
      <div class="hero__stat">
        ${renderSlot(cfg.stat)}
        <span class="mask"><span class="mask__in hero__stat-label">${esc(cfg.stat.label)}</span></span>
      </div>
    </div>
  </section>`;
}

/* ── Cursor reveal (mathis-biabiany style) ────────────────
 *
 * The wallpaper is drawn into a canvas, then masked by a second, low-res
 * "ink" canvas. The ink is redrawn every frame from the cursor's recent
 * path: soft, wobbly blobs that shrink and fade with age, so you get a
 * feathered free-form spot with a smeared trail that dissolves behind it.
 */
export function initHero(cfg) {
  cfgRef = cfg;
  const hero = document.querySelector('.hero');
  slot = initSlot(hero.querySelector('.slot'), cfg.stat);
  const canvas = hero.querySelector('.hero__reveal');
  const ctx = canvas.getContext('2d');
  const isTouch = window.matchMedia('(hover: none)').matches;

  const ink = document.createElement('canvas'); // the mask
  const ictx = ink.getContext('2d');
  const art = document.createElement('canvas'); // wallpaper rasterised at "cover" size
  const actx = art.getContext('2d');
  const INK_SCALE = 1; // mask resolution vs CSS px

  const wobble = cfg.revealWobble ?? 0.16;
  const life = Math.max(1, (cfg.revealTrail ?? 0.7) * 1000); // ms a trail point lasts
  const trail = []; // { x, y, born }

  let W = 0;
  let H = 0;
  let dpr = 1;
  const img = new Image();
  img.src = cfg.revealImage;

  const rasterise = () => {
    if (!img.complete || !img.naturalWidth) return;
    art.width = canvas.width;
    art.height = canvas.height;
    const s = Math.max(art.width / img.naturalWidth, art.height / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    actx.drawImage(img, (art.width - w) / 2, (art.height - h) / 2, w, h);
  };

  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ink.width = Math.round(W * INK_SCALE);
    ink.height = Math.round(H * INK_SCALE);
    circle.base = Math.min(240, Math.max(80, window.innerWidth * cfg.revealSize));
    if (circle.started) circle.tr = circle.base;
    rasterise();
  };
  img.onload = rasterise;
  resize();
  let rT;
  window.addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(resize, 120);
  });

  let lastMove = 0;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    circle.tx = e.clientX - r.left;
    circle.ty = e.clientY - r.top;
    lastMove = performance.now();
  });

  /* Soft, wobbly blob: a free-form outline filled with a radial gradient
     (solid centre → transparent edge) so the edge is feathered. */
  const POINTS = 40;
  // edge radius multiplier at angle a (the blob's free-form outline)
  const edge = (a, t) =>
    1 +
    wobble *
      (Math.sin(a * 2 + t * 0.9) * 0.5 +
        Math.sin(a * 3 - t * 1.3 + 1.7) * 0.35 +
        Math.sin(a * 5 + t * 0.6 + 4.1) * 0.15);

  const stamp = (cx, cy, r, t, alpha) => {
    const k = INK_SCALE;
    ictx.beginPath();
    for (let i = 0; i <= POINTS; i++) {
      const a = (i / POINTS) * Math.PI * 2;
      const rr = r * edge(a, t) * k;
      const x = cx * k + Math.cos(a) * rr;
      const y = cy * k + Math.sin(a) * rr;
      i ? ictx.lineTo(x, y) : ictx.moveTo(x, y);
    }
    const g = ictx.createRadialGradient(cx * k, cy * k, 0, cx * k, cy * k, r * k * (1 + wobble));
    g.addColorStop(0, `rgba(0,0,0,${alpha})`);
    g.addColorStop(0.62, `rgba(0,0,0,${alpha * 0.9})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ictx.fillStyle = g;
    ictx.fill();
  };

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);

  gsap.ticker.add(() => {
    if (!visible) return;
    const now = performance.now();
    const t = now / 1000;

    // Idle / touch: drift slowly on a lissajous path
    if (isTouch || now - lastMove > 3500) {
      circle.tx = W * (0.68 + 0.16 * Math.sin(t * 0.35));
      circle.ty = H * (0.38 + 0.14 * Math.sin(t * 0.5 + 1.2));
    }

    const px = circle.x;
    const py = circle.y;
    circle.x += (circle.tx - circle.x) * 0.09;
    circle.y += (circle.ty - circle.y) * 0.09;
    circle.r += (circle.tr - circle.r) * 0.08;

    // 1. record the path travelled this frame (spaced, so fast moves leave no gaps)
    const dist = Math.hypot(circle.x - px, circle.y - py);
    const steps = Math.min(12, Math.ceil(dist / (circle.r * 0.3)));
    for (let i = 1; i <= steps; i++) {
      const f = i / steps;
      trail.push({ x: px + (circle.x - px) * f, y: py + (circle.y - py) * f, born: now });
    }
    while (trail.length && now - trail[0].born > life) trail.shift();

    // 2. redraw the ink: old points smaller and fainter, cursor spot solid
    ictx.clearRect(0, 0, ink.width, ink.height);
    for (const p of trail) {
      const age = (now - p.born) / life; // 0 → 1
      const k = 1 - age;
      stamp(p.x, p.y, circle.r * (0.45 + 0.55 * k), t, 0.55 * k * k);
    }
    stamp(circle.x, circle.y, circle.r, t, 1);

    // 3. wallpaper, kept only where there is ink
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!art.width || !ink.width) return; // wallpaper not loaded yet / hero has no size
    ctx.drawImage(art, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(ink, 0, 0, canvas.width, canvas.height);
  });

  // the spot grows in when the hero intro plays
  circle.setRadius = () => {
    circle.started = true;
    circle.tr = circle.base;
  };
}

/* ── Typewriter: type → hold → delete → next ─────────────── */
function typewriter(el, cfg) {
  const phrases = [cfg.title, ...(cfg.typeLoop || [])];
  let p = 0;
  let i = 0;
  let deleting = false;

  const loop = () => {
    const word = phrases[p];
    if (!deleting) {
      i++;
      el.textContent = word.slice(0, i);
      if (i === word.length) {
        deleting = true;
        return setTimeout(loop, cfg.holdTime);
      }
      return setTimeout(loop, cfg.typeSpeed * (0.7 + Math.random() * 0.6));
    }
    i--;
    el.textContent = word.slice(0, i);
    if (i === 0) {
      deleting = false;
      p = (p + 1) % phrases.length;
      return setTimeout(loop, 450);
    }
    setTimeout(loop, cfg.deleteSpeed);
  };
  loop();
}

export function playHeroIntro() {
  const cfg = cfgRef;
  const hero = document.querySelector('.hero');
  circle.setRadius();

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.nav__link', { yPercent: -120, opacity: 0, duration: 1, stagger: 0.08 })
    .add(() => typewriter(hero.querySelector('.hero__typed'), cfg), 0.2)
    .to(hero.querySelectorAll('.hero__bio .mask__in'), { y: 0, yPercent: 0, duration: 1.1, stagger: 0.012 }, 0.4)
    .to(hero.querySelectorAll('.hero__stat .mask__in'), { y: 0, yPercent: 0, duration: 1.2, stagger: 0.12 }, 0.7)
    .from(hero.querySelectorAll('.reel'), { autoAlpha: 0, y: '0.25em', rotationX: -40, duration: 1, stagger: 0.08 }, 0.6)
    .from(hero.querySelector('.slot__suffix'), { autoAlpha: 0, y: '0.25em', duration: 1 }, 0.84)
    .from(hero.querySelector('.slot__lever'), { autoAlpha: 0, y: '0.3em', duration: 0.9 }, 1.1)
    .add(() => slot.intro(), 0.75);
}
