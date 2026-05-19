const PIXWARE_CONFIG = {
  siteName: 'Pixware Studios',
  email: 'info@pixwarestudios.com',
  formspreeNewsletter: '',
  formspreeContact: '',
  launcherRepo: '../PixwareLauncher',
  useMailtoFallback: true,
  // Kurucu sifresi SHA-256
  // Bu kurucu sifresi: akdogan2526pixware
  founderPasswordHash: '54e863c88dcdf9bdc1ec2056a41457b49f362e21c716e3451079c119c44feb1a',
  // Admin listesi — kurucu yeni adminler ekleyebilir
  admins: [
    { id: 'founder', name: 'Kurucu', role: 'founder', createdAt: '2026-05-19' }
  ]
};

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
