/*
 * RGB dial colour picker (happening.studio style).
 * Three round dials (R, G, B) in the nav. Drag one around its centre (or
 * scroll on it, or use the arrow keys) to set that channel 0–255; the page
 * background follows live. Text flips between black and white, whichever
 * contrasts more with the picked colour (WCAG contrast ratio).
 * Double-click any dial to reset to the default colour.
 */

const CHANNELS = [
  { key: 'r', label: 'Red', fill: '#e8402f' },
  { key: 'g', label: 'Green', fill: '#45c84a' },
  { key: 'b', label: 'Blue', fill: '#2f5ce8' },
];
const STORE = 'nitz:bg';

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};
const toHex = ({ r, g, b }) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

// WCAG relative luminance + contrast
const lum = ({ r, g, b }) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Sets --bg, plus --ink (black/white text) and --on-black (bg if readable on black, else white). */
export function applyBg(rgb) {
  const L = lum(rgb);
  const onBlack = contrast(L, 0) >= 7 ? toHex(rgb) : '#ffffff';
  const ink = contrast(L, 0) >= contrast(L, 1) ? '#000000' : '#ffffff';
  const root = document.documentElement.style;
  root.setProperty('--bg', toHex(rgb));
  root.setProperty('--ink', ink);
  root.setProperty('--on-black', onBlack);
  document.documentElement.dataset.ink = ink === '#000000' ? 'dark' : 'light';
}

export function renderPicker(cfg) {
  if (!cfg?.enabled) return '';
  return `
  <div class="picker" role="group" aria-label="Background colour">
    ${CHANNELS.map(
      (c) => `
      <div class="dial" data-ch="${c.key}">
        <div class="dial__knob" role="slider" tabindex="0" aria-label="${c.label}" aria-valuemin="0" aria-valuemax="255"
             style="--fill:${c.fill}">
          <span class="dial__needle"></span>
        </div>
        <span class="dial__val">0</span>
      </div>`,
    ).join('')}
  </div>`;
}

export function initPicker(cfg, defaultHex) {
  // no colour fade on first paint (so a remembered colour doesn't fade in from the default)
  const html = document.documentElement;
  html.classList.add('theme-init');
  requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove('theme-init')));

  const start = hexToRgb(defaultHex);
  let rgb = { ...start };

  if (cfg?.remember) {
    try {
      const saved = localStorage.getItem(STORE);
      if (saved && /^#[0-9a-f]{6}$/i.test(saved)) rgb = hexToRgb(saved);
    } catch {
      /* storage unavailable → use default */
    }
  }

  const root = document.querySelector('.picker');
  if (!root) {
    applyBg(start);
    return;
  }

  const dials = [...root.querySelectorAll('.dial')].map((el) => ({
    el,
    ch: el.dataset.ch,
    knob: el.querySelector('.dial__knob'),
    needle: el.querySelector('.dial__needle'),
    val: el.querySelector('.dial__val'),
  }));

  let saveT;
  const commit = (save = true) => {
    applyBg(rgb);
    dials.forEach((d) => {
      const v = rgb[d.ch];
      d.needle.style.transform = `rotate(${(v / 255) * 360}deg)`;
      d.val.textContent = v;
      d.knob.setAttribute('aria-valuenow', v);
    });
    if (save && cfg?.remember) {
      clearTimeout(saveT);
      saveT = setTimeout(() => {
        try {
          localStorage.setItem(STORE, toHex(rgb));
        } catch {
          /* ignore */
        }
      }, 250);
    }
  };

  const set = (ch, v) => {
    rgb[ch] = Math.max(0, Math.min(255, Math.round(v)));
    commit();
  };

  dials.forEach((d) => {
    // drag around the centre: 12 o'clock = 0, clockwise to 255
    const fromPointer = (e) => {
      const r = d.knob.getBoundingClientRect();
      const a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2)));
      return (((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * 255;
    };
    let dragging = false;
    let last = 0;
    d.knob.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      d.knob.setPointerCapture(e.pointerId);
      d.knob.focus({ preventScroll: true });
      dragging = true;
      last = fromPointer(e);
      d.el.classList.add('is-active');
    });
    d.knob.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const now = fromPointer(e);
      // don't jump across the 0/255 seam: stop at the ends instead
      let next = now;
      if (Math.abs(now - last) > 128) next = last > 128 ? 255 : 0;
      last = next;
      set(d.ch, next);
    });
    const end = () => {
      dragging = false;
      d.el.classList.remove('is-active');
    };
    d.knob.addEventListener('pointerup', end);
    d.knob.addEventListener('pointercancel', end);

    d.knob.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        set(d.ch, rgb[d.ch] + (e.deltaY < 0 ? 4 : -4));
      },
      { passive: false },
    );
    d.knob.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 20 : 5;
      const map = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: 32, PageDown: -32 };
      if (e.key in map) {
        e.preventDefault();
        set(d.ch, rgb[d.ch] + map[e.key]);
      } else if (e.key === 'Home') set(d.ch, 0);
      else if (e.key === 'End') set(d.ch, 255);
    });
    d.knob.addEventListener('dblclick', () => {
      rgb = { ...start };
      commit(false);
      if (cfg?.remember) {
        clearTimeout(saveT);
        try {
          localStorage.removeItem(STORE); // back to the site default
        } catch {
          /* ignore */
        }
      }
    });
  });

  commit(false); // initial paint: don't store anything until the visitor turns a dial
}
