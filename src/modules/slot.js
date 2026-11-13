import { gsap } from 'gsap';
import { esc } from './theme.js';

/*
 * Slot-machine view counter, casino style.
 * Each digit is its own 3D drum ("ring"): the ten digits sit around a
 * cylinder, and the drum rotates on its horizontal axis inside a framed
 * window, so the next digits roll over the top like a real reel.
 * Pull the lever (click, drag it down, or Enter/Space on it) and the drums
 * spin and stop left to right on a random number in range.
 */

const FACE = 1.02; // digit height in em (matches the hero number's line-height)
const STEP = 36; // degrees between digits (10 per turn)
const RADIUS = FACE / 2 / Math.tan(Math.PI / 10); // em, so faces meet edge to edge

export function renderSlot(stat) {
  const digits = String(stat.slot?.max ?? stat.value).length;
  const faces = Array.from(
    { length: 10 },
    (_, i) => `<span class="reel__face" style="transform: rotateX(${i * STEP}deg) translateZ(${RADIUS.toFixed(4)}em)">${i}</span>`,
  ).join('');
  const reels = Array.from({ length: digits }, () => `<span class="reel"><span class="reel__strip">${faces}</span></span>`).join('');

  return `
  <div class="slot">
    <span class="hero__stat-num slot__num">
      <span class="slot__reels" aria-hidden="true">${reels}</span><span class="slot__suffix">${esc(stat.suffix)}</span>
    </span>
    <span class="sr-only" aria-live="polite" data-slot-live></span>
    <button class="slot__lever" type="button" aria-label="Pull the lever to spin the view counter">
      <span class="slot__stick"></span>
      <span class="slot__knob"></span>
      <span class="slot__base"></span>
      ${stat.slot?.hint ? `<span class="slot__hint">${esc(stat.slot.hint)}</span>` : ''}
    </button>
  </div>`;
}

export function initSlot(root, stat) {
  const reels = [...root.querySelectorAll('.reel__strip')].map((el) => ({ el, idx: 10 }));
  const lever = root.querySelector('.slot__lever');
  const stick = lever.querySelector('.slot__stick');
  const knob = lever.querySelector('.slot__knob');
  const hint = lever.querySelector('.slot__hint');
  const live = root.querySelector('[data-slot-live]');
  const min = stat.slot?.min ?? stat.value;
  const max = stat.slot?.max ?? stat.value;

  let current = null;
  let spinning = false;

  const setIdx = (r, i) => {
    r.idx = i;
    // push the drum back by its radius so the front digit sits at true size
    r.el.style.transform = `translateZ(${(-RADIUS).toFixed(4)}em) rotateX(${(-i * STEP).toFixed(2)}deg)`; // symbols drop downward, like a real reel
  };
  reels.forEach((r) => setIdx(r, 10));

  /* ── spin to a number ──────────────────────────────────── */
  const spinTo = (n, { quick = false } = {}) => {
    spinning = true;
    current = n;
    const ds = String(n).padStart(reels.length, '0').split('').map(Number);
    root.classList.add('is-spinning');

    const tl = gsap.timeline({
      onComplete: () => {
        spinning = false;
        root.classList.remove('is-spinning');
        live.textContent = `${n}${stat.suffix} ${stat.label}`;
      },
    });

    reels.forEach((r, i) => {
      const turns = (quick ? 2 : 3) + i; // later reels keep spinning longer
      const target = Math.floor(r.idx / 10) * 10 + turns * 10 + ds[i];
      const o = { v: r.idx };
      tl.to(
        o,
        {
          v: target,
          duration: (quick ? 1 : 1.25) + i * 0.38,
          ease: 'back.out(0.9)',
          onUpdate() {
            setIdx(r, o.v);
            // motion blur while the reel is moving fast
            r.el.classList.toggle('is-blur', this.progress() < 0.7);
          },
          onComplete: () => {
            r.el.classList.remove('is-blur');
            setIdx(r, 10 + ds[i]); // same digit, reset near the top for the next spin
            gsap.fromTo(r.el.parentNode, { y: '-0.04em' }, { y: 0, duration: 0.35, ease: 'bounce.out' });
          },
        },
        i * 0.08,
      );
    });
  };

  const randomPick = () => {
    if (max <= min) return min;
    let n;
    do n = min + Math.floor(Math.random() * (max - min + 1));
    while (n === current);
    return n;
  };

  /* ── lever ─────────────────────────────────────────────── */
  // p: 0 = up, 1 = fully pulled (stick flips below the pivot)
  const setLever = (p) => {
    stick.style.transform = `scaleY(${(1 - 2 * p).toFixed(3)})`;
    knob.style.transform = `translate(-50%, ${(p * 1.4).toFixed(3)}em)`;
  };
  setLever(0);
  const lev = { p: 0 };

  const release = (fire) => {
    gsap.killTweensOf(lev);
    if (fire) {
      gsap
        .timeline()
        .to(lev, { p: 1, duration: 0.18 * (1 - lev.p) + 0.05, ease: 'power2.in', onUpdate: () => setLever(lev.p) })
        .add(() => spinTo(randomPick()))
        .to(lev, { p: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', onUpdate: () => setLever(lev.p) });
      if (hint) gsap.to(hint, { autoAlpha: 0, duration: 0.4 });
    } else {
      gsap.to(lev, { p: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', onUpdate: () => setLever(lev.p) });
    }
  };

  let drag = null;
  lever.addEventListener('pointerdown', (e) => {
    if (spinning) return;
    e.preventDefault();
    lever.setPointerCapture(e.pointerId);
    const travel = parseFloat(getComputedStyle(lever).fontSize) * 1.4; // px for a full pull
    drag = { y: e.clientY, travel, moved: false };
  });
  lever.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dy = e.clientY - drag.y;
    if (Math.abs(dy) > 4) drag.moved = true;
    lev.p = Math.max(0, Math.min(1, dy / drag.travel));
    setLever(lev.p);
  });
  const end = () => {
    if (!drag) return;
    const { moved } = drag;
    drag = null;
    // a click (no drag) pulls all the way; a drag must go past half-way
    release(!moved || lev.p > 0.5);
  };
  lever.addEventListener('pointerup', end);
  lever.addEventListener('pointercancel', end);
  lever.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !spinning) {
      e.preventDefault();
      release(true);
    }
  });

  return {
    // used by the hero intro: first spin lands on the configured value
    intro: () => spinTo(stat.value, { quick: true }),
  };
}
