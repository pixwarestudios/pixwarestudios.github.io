async function fetchPosts() {
  const base = typeof getBasePath === 'function' ? getBasePath() : '';
  const res = await fetch(`${base}data/posts.json`);
  if (!res.ok) throw new Error('Posts load failed');
  return res.json();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function postLink(slug, base) {
  if (base === '../') return `post.html?slug=${slug}`;
  return `${base}news/post.html?slug=${slug}`;
}

function postCardHtml(post, base) {
  return `
    <article class="card post-card fade-in">
      <div class="card-body">
        <div class="card-meta"><span>${formatDate(post.date)}</span></div>
        <h3 class="card-title">${post.title}</h3>
        <p class="card-text">${post.excerpt}</p>
        <a href="${postLink(post.slug, base)}" class="read-more">Devamını oku →</a>
      </div>
    </article>
  `;
}

async function renderPostsList(containerId, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const base = typeof getBasePath === 'function' ? getBasePath() : '';
  const posts = await fetchPosts();
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const list = limit ? sorted.slice(0, limit) : sorted;
  container.innerHTML = `<div class="grid grid-2">${list.map((p) => postCardHtml(p, base)).join('')}</div>`;
  container.querySelectorAll('.fade-in').forEach((el) => el.classList.add('visible'));
}

async function renderPostDetail() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const container = document.getElementById('post-content');
  if (!container || !slug) {
    if (container) container.innerHTML = '<p>Haber bulunamadı.</p>';
    return;
  }
  const posts = await fetchPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    container.innerHTML = '<p>Haber bulunamadı.</p>';
    return;
  }
  document.title = `${post.title} — Pixware Studios`;
  container.innerHTML = `
    <article class="post-article fade-in visible">
      <p class="post-date">${formatDate(post.date)}</p>
      <h1>${post.title}</h1>
      <div class="post-body">${post.body}</div>
      <p style="margin-top: 2rem;"><a href="index.html" class="btn">← Tüm haberler</a></p>
    </article>
  `;
}
