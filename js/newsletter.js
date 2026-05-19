function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initNewsletterForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const errorEl = form.querySelector('.form-error');
    const successEl = form.querySelector('.form-success');
    const email = emailInput?.value.trim();

    if (errorEl) errorEl.textContent = '';
    if (successEl) successEl.hidden = true;

    if (!email || !validateEmail(email)) {
      if (errorEl) errorEl.textContent = 'Geçerli bir e-posta adresi girin.';
      return;
    }

    // Try to read endpoint from data/site.json first (admin-managed), fallback to PIXWARE_CONFIG
    const base = (window.location.pathname && window.location.pathname.includes('/news/')) ? '../' : '';
    let endpoint = '';
    let provider = '';
    try {
      const siteRes = await fetch(base + 'data/site.json?t=' + Date.now());
      if (siteRes.ok) {
        const site = await siteRes.json();
        provider = site.newsletter?.provider || '';
        endpoint = site.newsletter?.endpoint || '';
      }
    } catch (e) {
      // ignore
    }
    const cfg = typeof PIXWARE_CONFIG !== 'undefined' ? PIXWARE_CONFIG : {};
    if (!endpoint) endpoint = cfg.formspreeNewsletter || '';
    if (!provider) provider = endpoint ? 'formspree' : 'mailto';

    if (provider === 'formspree' && endpoint) {
      const url = endpoint.includes('formspree.io') || endpoint.includes('/f/') ? endpoint : `https://formspree.io/f/${endpoint}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email, _subject: 'Pixware Newsletter' })
        });
        if (!res.ok) throw new Error('Submit failed');
        showNewsletterSuccess(form, successEl);
      } catch (err) {
        if (errorEl) errorEl.textContent = 'Gönderim başarısız. Lütfen tekrar deneyin.';
      }
    } else if (cfg.useMailtoFallback !== false) {
      window.location.href = `mailto:${cfg.email || 'info@pixwarestudios.com'}?subject=${encodeURIComponent('Newsletter kayıt')}&body=${encodeURIComponent('E-posta: ' + email)}`;
      showNewsletterSuccess(form, successEl);
    }
  });
}

function showNewsletterSuccess(form, successEl) {
  if (successEl) {
    successEl.hidden = false;
    successEl.textContent = 'Teşekkürler! Bülten listemize eklendiniz.';
  }
  form.reset();
}

function initAllNewsletterForms() {
  document.querySelectorAll('[data-newsletter-form]').forEach((form) => {
    if (form.id) initNewsletterForm(form.id);
  });
}
