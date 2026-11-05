import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { site } from './config/site.config.js';
import { applyTheme } from './modules/theme.js';
import { renderLoader, runLoader } from './modules/loader.js';
import { renderNav, initNav } from './modules/nav.js';
import { renderHero, initHero, playHeroIntro } from './modules/hero.js';
import { renderNotebook, initNotebook } from './modules/notebook.js';
import { renderContact, initContact } from './modules/contact.js';
import { renderLightbox, initLightbox } from './modules/lightbox.js';

import './styles/base.css';
import './styles/loader.css';
import './styles/hero.css';
import './styles/notebook.css';
import './styles/contact.css';

gsap.registerPlugin(ScrollTrigger);

// ── Meta + theme ───────────────────────────────────────────
document.title = site.meta.title;
document.querySelector('meta[name="description"]')?.setAttribute('content', site.meta.description);
applyTheme(site.theme);

// ── Render ────────────────────────────────────────────────
const app = document.getElementById('app');
app.innerHTML = [
  site.loader.enabled ? renderLoader(site.loader) : '',
  renderNav(site.nav),
  '<main>',
  renderHero(site.hero),
  renderNotebook(site.notebook),
  renderContact(site.contact),
  '</main>',
  renderLightbox(),
].join('');

// ── Smooth scroll ─────────────────────────────────────────
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = reduceMotion ? null : new Lenis({ lerp: 0.09, smoothWheel: true });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // locked until the loader finishes
}
window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ── Init ──────────────────────────────────────────────────
initNav({ lenis });
initHero(site.hero);
initNotebook(site.notebook);
initContact(site.contact);
initLightbox();

const start = () => {
  document.body.classList.remove('is-loading');
  lenis?.start();
  playHeroIntro();
  ScrollTrigger.refresh();
};

if (site.loader.enabled) runLoader(site.loader).then(start);
else start();
