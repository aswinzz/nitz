import { gsap } from 'gsap';
import { esc } from './theme.js';

let cfgRef;
const circle = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0 };

export function renderHero(cfg) {
  const words = cfg.bio
    .split(/\s+/)
    .map((w) => `<span class="mask"><span class="mask__in">${esc(w)}</span></span>`)
    .join(' ');

  return `
  <section class="hero" id="home">
    <div class="hero__reveal" style="background-image:url('${esc(cfg.revealImage)}')" data-preload="${esc(cfg.revealImage)}"></div>
    <div class="hero__content">
      <h1 class="hero__title" aria-label="${esc(cfg.title)}">
        <span class="hero__typed"></span><span class="hero__cursor" aria-hidden="true">|</span>
      </h1>
      <p class="hero__bio">${words}</p>
      <div class="hero__stat">
        <span class="mask"><span class="mask__in hero__stat-num"><span class="hero__count">0</span>${esc(cfg.stat.suffix)}</span></span>
        <span class="mask"><span class="mask__in hero__stat-label">${esc(cfg.stat.label)}</span></span>
      </div>
    </div>
  </section>`;
}

/* ── Cursor-following circle reveal ─────────────────────── */
export function initHero(cfg) {
  cfgRef = cfg;
  const hero = document.querySelector('.hero');
  const reveal = hero.querySelector('.hero__reveal');
  const isTouch = window.matchMedia('(hover: none)').matches;

  // Starting point: peeking from the top-left corner (as in the reference)
  circle.x = circle.tx = 0;
  circle.y = circle.ty = 0;

  let lastMove = 0;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    circle.tx = e.clientX - r.left;
    circle.ty = e.clientY - r.top;
    lastMove = performance.now();
  });

  gsap.ticker.add(() => {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    const now = performance.now();

    // Idle / touch: drift slowly on a lissajous path
    if (isTouch || now - lastMove > 3500) {
      const t = now / 1000;
      circle.tx = w * (0.68 + 0.16 * Math.sin(t * 0.35));
      circle.ty = h * (0.38 + 0.14 * Math.sin(t * 0.5 + 1.2));
    }

    circle.x += (circle.tx - circle.x) * 0.075;
    circle.y += (circle.ty - circle.y) * 0.075;
    circle.r += (circle.tr - circle.r) * 0.08;

    reveal.style.clipPath = `circle(${circle.r.toFixed(1)}px at ${circle.x.toFixed(1)}px ${circle.y.toFixed(1)}px)`;
    // subtle parallax on the image inside the circle
    reveal.style.backgroundPosition = `${50 + ((circle.x / w) - 0.5) * -6}% ${50 + ((circle.y / h) - 0.5) * -6}%`;
  });

  const setRadius = () => {
    circle.tr = window.innerWidth * cfg.revealSize * (window.innerWidth < 768 ? 1.4 : 1);
  };
  window.addEventListener('resize', setRadius);
  circle.setRadius = setRadius;
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
    .add(() => {
      const n = { v: 0 };
      const out = hero.querySelector('.hero__count');
      gsap.to(n, {
        v: cfg.stat.value,
        duration: 2.2,
        ease: 'power3.out',
        onUpdate: () => (out.textContent = Math.round(n.v)),
      });
    }, 0.75);
}
