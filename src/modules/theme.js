const map = {
  bg: '--bg',
  ink: '--ink',
  paper: '--paper',
  paperDark: '--paper-dark',
  card: '--card',
  loaderBg: '--loader-bg',
  loaderInk: '--loader-ink',
};

export function applyTheme(theme = {}) {
  const root = document.documentElement.style;
  Object.entries(theme).forEach(([k, v]) => map[k] && root.setProperty(map[k], v));
}

/** Escape text coming from the config before putting it in HTML. */
export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
