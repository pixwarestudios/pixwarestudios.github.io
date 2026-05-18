function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/news/')) return '../';
  return '';
}

function fixPartialPaths(container) {
  const base = getBasePath();
  container.querySelectorAll('[data-base-href]').forEach((el) => {
    el.href = base + el.getAttribute('data-base-href');
  });
  container.querySelectorAll('[data-base-src]').forEach((el) => {
    el.src = base + el.getAttribute('data-base-src');
  });
}

async function loadPartial(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const base = getBasePath();
    const res = await fetch(base + url);
    if (!res.ok) throw new Error('Partial load failed');
    el.innerHTML = await res.text();
    fixPartialPaths(el);
  } catch (err) {
    console.warn('Could not load partial:', url, err);
  }
}

async function injectLayout() {
  await Promise.all([
    loadPartial('site-header', 'partials/header.html'),
    loadPartial('site-footer', 'partials/footer.html')
  ]);
}
