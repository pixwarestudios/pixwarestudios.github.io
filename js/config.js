const PIXWARE_CONFIG = {
  siteName: 'Pixware Studios',
  email: 'info@pixwarestudios.com',
  formspreeNewsletter: '',
  formspreeContact: '',
  launcherRepo: '../PixwareLauncher',
  useMailtoFallback: true,
  // Admin sifresi SHA-256 — varsayilan: pixware2026
  // Yeni hash: tarayici konsolunda hashPassword('yeni-sifre') (admin.js)
  adminPasswordHash: 'bcb2e3f83a9b925478a9b2c471959b388c7c9dd4fe9873d8ef08adc5ecff5ab2'
};

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
