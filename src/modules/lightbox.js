import { gsap } from 'gsap';

export function renderLightbox() {
  return `
  <div class="lightbox" aria-hidden="true">
    <button class="lightbox__close" aria-label="Close">Close ✕</button>
    <div class="lightbox__frame"></div>
  </div>`;
}

/** Turn a YouTube / Vimeo / file URL into an embeddable element. */
function embed(url) {
  const yt = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  if (yt) return `<iframe src="https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `<iframe src="https://player.vimeo.com/video/${vm[1]}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  return `<video src="${url}" controls autoplay playsinline></video>`;
}

export function initLightbox() {
  const lb = document.querySelector('.lightbox');
  const frame = lb.querySelector('.lightbox__frame');

  const open = (url) => {
    frame.innerHTML = embed(url);
    document.body.classList.add('lightbox-open');
    lb.setAttribute('aria-hidden', 'false');
    gsap.fromTo(lb, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' });
    gsap.fromTo(frame, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, delay: 0.4, ease: 'power3.out' });
  };
  const close = () => {
    gsap.to(lb, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.8,
      ease: 'expo.inOut',
      onComplete: () => {
        frame.innerHTML = '';
        document.body.classList.remove('lightbox-open');
        lb.setAttribute('aria-hidden', 'true');
      },
    });
  };

  document.addEventListener('click', (e) => {
    const p = e.target.closest('[data-video]');
    if (p) open(p.dataset.video);
  });
  lb.querySelector('.lightbox__close').addEventListener('click', close);
  lb.addEventListener('click', (e) => e.target === lb && close());
  window.addEventListener('keydown', (e) => e.key === 'Escape' && document.body.classList.contains('lightbox-open') && close());
}
