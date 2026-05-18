async function fetchTeam() {
  const base = typeof getBasePath === 'function' ? getBasePath() : '';
  const res = await fetch(`${base}data/team.json`);
  if (!res.ok) throw new Error('Team load failed');
  const team = await res.json();
  return team.sort((a, b) => (a.order || 0) - (b.order || 0));
}

async function fetchSite() {
  const base = typeof getBasePath === 'function' ? getBasePath() : '';
  const res = await fetch(`${base}data/site.json`);
  if (!res.ok) throw new Error('Site load failed');
  return res.json();
}

function teamCardHtml(member) {
  const links = [];
  if (member.social?.github) {
    links.push(`<a href="${member.social.github}" target="_blank" rel="noopener" aria-label="GitHub">GitHub</a>`);
  }
  if (member.social?.twitter) {
    links.push(`<a href="${member.social.twitter}" target="_blank" rel="noopener" aria-label="Twitter">Twitter</a>`);
  }
  if (member.social?.linkedin) {
    links.push(`<a href="${member.social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">LinkedIn</a>`);
  }
  const socialHtml = links.length
    ? `<div class="team-social">${links.join(' · ')}</div>`
    : '';

  return `
    <article class="card team-card fade-in">
      <div class="team-avatar">${member.avatar || '👤'}</div>
      <div class="card-body">
        <h3 class="card-title">${member.name}</h3>
        <p class="team-role">${member.role}</p>
        <p class="card-text">${member.bio}</p>
        ${socialHtml}
      </div>
    </article>
  `;
}

async function renderTeamGrid(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const team = await fetchTeam();
  container.innerHTML = `<div class="grid grid-3">${team.map(teamCardHtml).join('')}</div>`;
  container.querySelectorAll('.fade-in').forEach((el) => el.classList.add('visible'));
}

async function renderAboutContent() {
  const visionEl = document.getElementById('about-vision');
  if (!visionEl) return;
  try {
    const site = await fetchSite();
    if (site.studio?.vision?.length) {
      visionEl.innerHTML = site.studio.vision
        .map((p) => `<p style="color: var(--text-secondary); margin-bottom: 1rem;">${p}</p>`)
        .join('');
    }
  } catch (e) {
    console.warn('Site content load failed', e);
  }
}
