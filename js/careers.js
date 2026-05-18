async function fetchJobs() {
  const base = typeof getBasePath === 'function' ? getBasePath() : '';
  const res = await fetch(`${base}data/jobs.json`);
  if (!res.ok) throw new Error('Jobs load failed');
  return res.json();
}

function jobCardHtml(job) {
  const reqs = job.requirements.map((r) => `<li>${r}</li>`).join('');
  return `
    <article class="card job-card fade-in">
      <span class="job-type">${job.type}</span>
      <h3 class="card-title">${job.title}</h3>
      <p class="card-meta">${job.location}</p>
      <p class="card-text">${job.description}</p>
      <h4 style="font-size: 0.9rem; margin: 1rem 0 0.5rem; color: var(--neon-accent);">Gereksinimler</h4>
      <ul>${reqs}</ul>
      <a href="contact.html#apply" class="btn btn-primary" data-base-href="contact.html#apply">Başvur</a>
    </article>
  `;
}

async function renderJobs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const jobs = await fetchJobs();
  container.innerHTML = `<div class="grid grid-2">${jobs.map(jobCardHtml).join('')}</div>`;
  if (typeof fixPartialPaths === 'function') fixPartialPaths(container);
  container.querySelectorAll('.fade-in').forEach((el) => el.classList.add('visible'));
}
