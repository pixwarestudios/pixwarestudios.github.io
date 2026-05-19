const CATEGORY_EMOJI = {
  RPG: '🎭',
  Action: '⚔️',
  Adventure: '🗻',
  Multiplayer: '🎯',
  Puzzle: '🧩'
};

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

async function fetchGames() {
  const base = typeof getBasePath === 'function' ? getBasePath() : '';
  const res = await fetch(`${base}data/games.json`);
  if (!res.ok) throw new Error('Games load failed');
  return res.json();
}

function gameCardHtml(game, showActions = true) {
  const lang = (window.i18n && window.i18n.getLang) ? window.i18n.getLang() : 'tr';
  const emoji = game.emoji || CATEGORY_EMOJI[game.category] || '🎮';
  const firstImage = (game.screenshots && game.screenshots.length) ? game.screenshots[0] : game.imageUrl;
  const imageHtml = firstImage
    ? `<img src="${firstImage}" alt="${(game.name && typeof game.name==='object')? (game.name[lang]||game.name.tr) : game.name} görseli">`
    : emoji;
  const actions = showActions
    ? `<div class="card-actions game-card">
         <button class="btn" type="button" data-detail="${game.id}">Ayrıntılar</button>
         <a href="launcher.html" class="btn btn-primary" data-base-href="launcher.html">Launcher'da Aç</a>
       </div>`
    : '';
  const name = (game.name && typeof game.name === 'object') ? (game.name[lang] || game.name.tr || game.name.en) : game.name;
  const desc = (game.description && typeof game.description === 'object') ? (game.description[lang] || game.description.tr || game.description.en) : game.description;
  return `
    <article class="card game-card fade-in" data-game-id="${game.id}">
      <div class="card-image">${imageHtml}</div>
      <div class="card-body">
        <h3 class="card-title">${name}</h3>
        <div class="card-meta">
          <span>${game.category}</span>
          <span>⭐ ${game.rating}</span>
        </div>
        <div class="card-meta"><span>${game.size}</span></div>
        <p class="card-text">${desc}</p>
        ${actions}
      </div>
    </article>
  `;
}

function showGameModal(game) {
  const lang = (window.i18n && window.i18n.getLang) ? window.i18n.getLang() : 'tr';
  const mainImg = (game.screenshots && game.screenshots.length) ? game.screenshots[0] : game.imageUrl;
  const imageHtml = mainImg
    ? `<div style="margin-bottom:1rem;"><img id="modal-main-image" src="${mainImg}" alt="${(game.name && typeof game.name==='object')? (game.name[lang]||game.name.tr) : game.name} görseli" style="width:100%;border-radius:16px;object-fit:cover;max-height:320px;"></div>`
    : '';
  const html = `
    ${imageHtml}
    ${game.screenshots && game.screenshots.length ? `<div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;">${game.screenshots.map((s)=>`<img src="${s}" alt="thumb" style="width:80px;height:56px;object-fit:cover;border-radius:8px;cursor:pointer;" onclick="document.getElementById('modal-main-image').src='${s}'">`).join('')}</div>` : ''}
      <div class="modal-detail-grid">
      <div>
        <h3 style="color: var(--neon-accent); margin-bottom: 0.5rem;">${(lang==='en')? 'About the game' : 'Oyun Hakkında'}</h3>
        <p style="color: var(--text-secondary);">${desc}</p>
        <p style="margin-top: 1rem;"><strong>${(lang==='en')? 'Size' : 'Boyut'}:</strong> ${game.size}</p>
        <p><strong>Rating:</strong> ⭐ ${game.rating}</p>
      </div>
      <div>
        <h3 style="color: var(--neon-secondary); margin-bottom: 0.5rem;">Sistem Gereksinimleri</h3>
        <ul>
          <li>💾 8GB boş alan</li>
          <li>🖥️ GTX 1060 veya üstü</li>
          <li>🧠 8GB RAM</li>
          <li>🔌 İnternet bağlantısı</li>
        </ul>
      </div>
    </div>
    <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
      <a href="launcher.html" class="btn btn-primary" style="flex:1;text-align:center;">Launcher ile İndir</a>
      <button class="btn" type="button" onclick="closeModal()" style="flex:1;">Kapat</button>
    </div>
  `;
  openModal(game.name, html);
}

function bindGameDetailButtons(container, games) {
  container.querySelectorAll('[data-detail]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-detail'), 10);
      const game = games.find((g) => g.id === id);
      if (game) showGameModal(game);
    });
  });
}

async function renderGamesGrid(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const games = await fetchGames();
  const categories = Array.from(new Set(games.map((g) => g.category).filter(Boolean))).sort();

  const searchPlaceholder = (window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t('search.placeholder') || 'Oyun ara...' : 'Oyun ara...';
  container.innerHTML = `
    <div class="games-filter-bar">
      <input id="game-search" type="search" placeholder="${esc(searchPlaceholder)}" data-i18n-placeholder="search.placeholder">
      <select id="game-category-filter">
        <option value="">Tüm kategoriler</option>
        ${categories.map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join('')}
      </select>
    </div>
    <div id="games-list" class="grid grid-3"></div>
  `;

  const gamesListEl = container.querySelector('#games-list');
  const searchInput = container.querySelector('#game-search');
  const categorySelect = container.querySelector('#game-category-filter');

  const updateGrid = () => {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const filtered = games.filter((g) => {
      const text = `${g.name} ${g.description} ${g.category}`.toLowerCase();
      return (!category || g.category === category) && (!query || text.includes(query));
    });

    gamesListEl.innerHTML = filtered.length
      ? `<div class="grid grid-3">${filtered.map((g) => gameCardHtml(g, options.showActions !== false)).join('')}</div>`
      : '<p style="color: var(--text-secondary);">Aradiginiz kriterlere uygun oyun bulunamadi.</p>';

    bindGameDetailButtons(container, games);
    if (typeof initScrollAnimations === 'function') {
      container.querySelectorAll('.fade-in').forEach((el) => {
        requestAnimationFrame(() => el.classList.add('visible'));
      });
    }
  };

  searchInput.addEventListener('input', updateGrid);
  categorySelect.addEventListener('change', updateGrid);

  updateGrid();
}
