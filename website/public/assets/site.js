(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-button');
  const art = document.querySelector('#hero-art');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const update = theme => {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(dark));
      const label = dark ? toggle.dataset.light : toggle.dataset.dark;
      toggle.querySelector('[data-theme-label]').textContent = label;
      toggle.setAttribute('aria-label', label);
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0b1027' : '#f2f3fc';
    if (art) art.src = dark ? art.dataset.night : art.dataset.day;
  };
  update(root.dataset.theme);
  toggle?.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('osaa601-theme', theme); } catch (_) {}
    update(theme);
  });
  media.addEventListener('change', event => {
    let saved;
    try { saved = localStorage.getItem('osaa601-theme'); } catch (_) {}
    if (saved !== 'light' && saved !== 'dark') update(event.matches ? 'dark' : 'light');
  });
  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('#mobile-nav');
  const closeMenu = () => {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', 'false');
    nav.hidden = true;
  };
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    nav.hidden = !expanded;
  });
  nav?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menu.focus();
    }
  });
  window.matchMedia('(min-width: 941px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
  const copy = document.querySelector('[data-copy-email]');
  copy?.addEventListener('click', async () => {
    const status = document.querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText(copy.dataset.copyEmail);
      status.textContent = copy.dataset.success;
    } catch (_) { status.textContent = copy.dataset.fallback + copy.dataset.copyEmail; }
  });
})();
