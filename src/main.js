import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { site } from './config/site.config.js';
import { applyTheme } from './modules/theme.js';
import { renderNav, initNav } from './modules/nav.js';
import { initPicker } from './modules/colorpicker.js';
import { renderHero, initHero, playHeroIntro } from './modules/hero.js';
import { renderNotebook, initNotebook } from './modules/notebook.js';
import { renderContact, initContact } from './modules/contact.js';
import { renderLightbox, initLightbox } from './modules/lightbox.js';

import './styles/base.css';
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
  renderNav(site.nav, site.colorPicker),
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
}
window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ── Init ──────────────────────────────────────────────────
initNav({ lenis });
initPicker(site.colorPicker, site.theme.bg);
initHero(site.hero);
initNotebook(site.notebook);
initContact(site.contact);
initLightbox();

// Play the intro once fonts are in, so the typed title doesn't reflow
document.fonts.ready.then(() => {
  playHeroIntro();
  ScrollTrigger.refresh();
});
