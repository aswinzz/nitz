import { gsap } from 'gsap';
import { esc } from './theme.js';

export function renderLoader(cfg) {
  return `
  <div class="loader" aria-hidden="true">
    <div class="loader__word"><span class="loader__word-inner">${esc(cfg.words[0] || '')}</span></div>
    <div class="loader__count"><span class="loader__count-inner">0</span></div>
  </div>`;
}

/** Real asset progress (fonts + every image in the page + CSS bg images). */
function trackAssets() {
  const urls = new Set(
    [...document.images].map((i) => i.currentSrc || i.src).filter(Boolean),
  );
  document.querySelectorAll('[data-preload]').forEach((el) => urls.add(el.dataset.preload));

  const total = urls.size + 1;
  let done = 0;
  const state = { progress: 0 };
  const tick = () => {
    done += 1;
    state.progress = done / total;
  };

  document.fonts.ready.then(tick);
  urls.forEach((src) => {
    const img = new Image();
    img.onload = img.onerror = tick;
    img.src = src;
  });
  return state;
}

/**
 * Counter climbs 0 → 100 in irregular steps (never ahead of real loading),
 * words swap with a masked slide, then the panel wipes up.
 */
export function runLoader(cfg) {
  const root = document.querySelector('.loader');
  const countEl = root.querySelector('.loader__count-inner');
  const wordEl = root.querySelector('.loader__word-inner');
  const words = cfg.words.length ? cfg.words : [''];
  const assets = trackAssets();
  const t0 = performance.now();

  let shown = 0;
  let wordIndex = 0;

  const swapWord = (i) => {
    gsap
      .timeline()
      .to(wordEl, { yPercent: -110, duration: 0.35, ease: 'power3.in' })
      .add(() => {
        wordEl.textContent = words[i];
      })
      .fromTo(wordEl, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'power3.out' });
  };

  gsap.from([wordEl, countEl], { yPercent: 110, duration: 0.8, ease: 'power3.out', stagger: 0.08 });

  return new Promise((resolve) => {
    const step = () => {
      const timeP = Math.min(1, (performance.now() - t0) / cfg.minDuration);
      const target = Math.floor(Math.min(timeP, assets.progress) * 100);

      if (shown < target) {
        // jump by a random chunk so it feels like real loading
        shown = Math.min(target, shown + Math.ceil(Math.random() * 7));
        countEl.textContent = shown;
        const wi = Math.min(words.length - 1, Math.floor((shown / 100) * words.length));
        if (wi !== wordIndex) {
          wordIndex = wi;
          swapWord(wi);
        }
      }

      if (shown >= 100) return exit(resolve);
      setTimeout(step, 40 + Math.random() * 90);
    };
    step();
  });

  function exit(resolve) {
    gsap
      .timeline({ delay: 0.35 })
      .to([wordEl, countEl], { yPercent: -110, duration: 0.6, ease: 'power3.in', stagger: 0.05 })
      .to(root, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 1.1,
        ease: 'expo.inOut',
      }, '-=0.15')
      .add(resolve, '-=0.6')
      .add(() => root.remove());
  }
}
