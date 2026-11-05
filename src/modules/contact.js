import { gsap } from 'gsap';
import { esc } from './theme.js';

export function renderContact(c) {
  const footer = esc(c.footer).replace('{year}', new Date().getFullYear());
  return `
  <section class="contact" id="contact">
    <div class="contact__stage">
      <div class="contact__tilt">
      <div class="contact__card">
        <h2 class="contact__heading">${esc(c.heading)}</h2>
        <a class="contact__box" href="mailto:${esc(c.email)}" data-email="${esc(c.email)}">
          <span class="contact__label">${esc(c.label)}</span>
          <span class="contact__email">${esc(c.email)}</span>
          <span class="contact__copied">${esc(c.copiedText)}</span>
        </a>
      </div>
      </div>
    </div>
    <footer class="footer">
      <p>${footer}</p>
      <ul class="footer__socials">
        ${c.socials.map((s) => `<li><a href="${esc(s.href)}" target="_blank" rel="noopener" class="nav__link"><span data-text="${esc(s.label)}">${esc(s.label)}</span></a></li>`).join('')}
      </ul>
    </footer>
  </section>`;
}

export function initContact() {
  const section = document.querySelector('.contact');
  const card = section.querySelector('.contact__card');
  const box = section.querySelector('.contact__box');
  const tilt = section.querySelector('.contact__tilt');

  // Card is "handed" up into frame as you scroll in (scrubbed).
  gsap.fromTo(
    card,
    { yPercent: 70, rotation: -7, rotationX: 25, opacity: 0.4 },
    {
      yPercent: 0,
      rotation: 0,
      rotationX: 0,
      opacity: 1,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 95%', end: 'center 60%', scrub: 1 },
    },
  );

  // Gentle 3D tilt toward the cursor
  section.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width;
    const y = (e.clientY - (r.top + r.height / 2)) / r.height;
    gsap.to(tilt, { '--ry': `${x * 10}deg`, '--rx': `${-y * 10}deg`, duration: 0.8, ease: 'power3.out' });
  });
  section.addEventListener('pointerleave', () =>
    gsap.to(tilt, { '--ry': '0deg', '--rx': '0deg', duration: 1, ease: 'power3.out' }),
  );

  // Click copies the email (mailto still fires on modifier-click)
  box.addEventListener('click', async (e) => {
    if (e.metaKey || e.ctrlKey) return;
    try {
      await navigator.clipboard.writeText(box.dataset.email);
      e.preventDefault();
      box.classList.add('is-copied');
      setTimeout(() => box.classList.remove('is-copied'), 1600);
    } catch {
      /* clipboard blocked → let mailto: open */
    }
  });
}
