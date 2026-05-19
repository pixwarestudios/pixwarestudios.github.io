const PIXWARE_CONFIG = {
  siteName: 'Pixware Studios',
  email: 'info@pixwarestudios.com',
  formspreeNewsletter: '',
  formspreeContact: '',
  launcherRepo: '../PixwareLauncher',
  useMailtoFallback: true,
  // Kurucu sifresi SHA-256
  // Bu kurucu sifresi: akdogan25e26pixware
  founderPasswordHash: '9e47ddef92e24ef4320f77653b493f6348aa11634ad1bd8f040d81917f41129d',
  // Admin listesi — kurucu yeni adminler ekleyebilir
  admins: [
    { id: 'founder', name: 'Kurucu', role: 'founder', createdAt: '2026-05-19' }
  ]
};

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
