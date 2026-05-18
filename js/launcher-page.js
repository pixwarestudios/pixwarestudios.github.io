async function loadLauncherInfo() {
  const base = typeof getBasePath === 'function' ? getBasePath() : '';
  const res = await fetch(`${base}data/launcher.json`);
  if (!res.ok) return;
  const data = await res.json();

  const versionEl = document.getElementById('launcher-version');
  if (versionEl) versionEl.textContent = data.version;

  const reqList = document.getElementById('launcher-requirements');
  if (reqList && data.requirements) {
    reqList.innerHTML = data.requirements.map((r) => `<li>${r}</li>`).join('');
  }

  const winBtn = document.getElementById('download-windows');
  const linuxBtn = document.getElementById('download-linux');
  if (data.downloads?.windows && winBtn) {
    winBtn.href = data.downloads.windows;
    winBtn.classList.remove('disabled');
    winBtn.removeAttribute('disabled');
  }
  if (data.downloads?.linux && linuxBtn) {
    linuxBtn.href = data.downloads.linux;
    linuxBtn.classList.remove('disabled');
    linuxBtn.removeAttribute('disabled');
  }
}
