import { esc } from './theme.js';

const link = (l) =>
  `<a class="nav__link" href="${esc(l.href)}"><span data-text="${esc(l.label)}">${esc(l.label)}</span></a>`;

export function renderNav(cfg) {
  return `
  <header class="nav">
    <nav class="nav__group">${cfg.left.map(link).join('')}</nav>
    <nav class="nav__group nav__group--right">${cfg.right.map(link).join('')}</nav>
  </header>`;
}

export function initNav({ lenis }) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else target.scrollIntoView({ behavior: 'smooth' });
  });
}
