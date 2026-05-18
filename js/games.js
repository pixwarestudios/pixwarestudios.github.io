const CATEGORY_EMOJI = {
  RPG: '🎭',
  Action: '⚔️',
  Adventure: '🗻',
  Multiplayer: '🎯',
  Puzzle: '🧩'
};

async function fetchGames() {
  const base = typeof getBasePath === 'function' ? getBasePath() : '';
  const res = await fetch(`${base}data/games.json`);
  if (!res.ok) throw new Error('Games load failed');
  return res.json();
}

function gameCardHtml(game, showActions = true) {
  const emoji = game.emoji || CATEGORY_EMOJI[game.category] || '🎮';
  const actions = showActions
    ? `<div class="card-actions game-card">
         <button class="btn" type="button" data-detail="${game.id}">Ayrıntılar</button>
         <a href="launcher.html" class="btn btn-primary" data-base-href="launcher.html">Launcher'da Aç</a>
       </div>`
    : '';

  return `
    <article class="card game-card fade-in" data-game-id="${game.id}">
      <div class="card-image">${emoji}</div>
      <div class="card-body">
        <h3 class="card-title">${game.name}</h3>
        <div class="card-meta">
          <span>${game.category}</span>
          <span>⭐ ${game.rating}</span>
        </div>
        <div class="card-meta"><span>${game.size}</span></div>
        <p class="card-text">${game.description}</p>
        ${actions}
      </div>
    </article>
  `;
}

function showGameModal(game) {
  const html = `
    <div class="modal-detail-grid">
      <div>
        <h3 style="color: var(--neon-accent); margin-bottom: 0.5rem;">Oyun Hakkında</h3>
        <p style="color: var(--text-secondary);">${game.description}</p>
        <p style="margin-top: 1rem;"><strong>Boyut:</strong> ${game.size}</p>
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
  let list = games;
  if (options.featuredOnly) {
    list = games.filter((g) => g.featured);
  }
  if (options.limit) {
    list = list.slice(0, options.limit);
  }

  container.innerHTML = `<div class="grid grid-3">${list.map((g) => gameCardHtml(g, options.showActions !== false)).join('')}</div>`;

  if (typeof fixPartialPaths === 'function') {
    fixPartialPaths(container);
  }

  bindGameDetailButtons(container, games);

  if (typeof initScrollAnimations === 'function') {
    container.querySelectorAll('.fade-in').forEach((el) => {
      requestAnimationFrame(() => el.classList.add('visible'));
    });
  }
}
