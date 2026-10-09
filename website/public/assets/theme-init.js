/* Run before paint. A saved choice wins; otherwise follow the device. */
(() => {
  let theme;
  try { theme = localStorage.getItem('osaa601-theme'); } catch (_) {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
})();
