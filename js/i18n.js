// Simple i18n helper for TR/EN — attaches to window.i18n
(function(){
  const KEY = 'pixware_lang';
  const defaultLang = localStorage.getItem(KEY) || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'tr');
  const translations = {
    en: {
      'nav.home': 'Home',
      'nav.games': 'Games',
      'nav.launcher': 'Launcher',
      'nav.news': 'News',
      'nav.careers': 'Careers',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.download': 'Download',
      'brand.name': 'PIXWARE',
      'brand.sub': 'STUDIOS',
      'hero.title': 'Pixware Studios',
      'hero.subtitle': 'Creating unforgettable game experiences in neon worlds. Manage, discover and play with our launcher.',
      'hero.cta_download': 'Download Launcher',
      'hero.cta_explore': 'Explore Games',
      'news.title': 'News',
      'news.subtitle': 'Updates, patches and announcements from the studio.',
      'news.loading': 'Loading...',
      'footer.tag': 'Independent game studio. We craft memorable experiences in neon worlds.',
      'footer.rights': 'All rights reserved.',
      'footer.made': 'Made with neon in Turkey',
      'search.placeholder': 'Search games...',
      'latest.news': 'Latest News',
      'featured.games': 'Featured Games',
      'all.games': 'All Games',
      'newsletter.title': 'Join our Newsletter',
      'newsletter.subtitle': 'Sign up for new games, updates and beta invites in your inbox.',
      'newsletter.email': 'Your email',
      'newsletter.subscribe': 'Subscribe',
      'about.title': 'About',
      'careers.title': 'Careers',
      'contact.title': 'Contact',
      'launcher.title': 'Launcher',
      'launcher.subtitle': 'Your game library, store, friends and downloads in one app.'
    }
  };

  function getLang(){ return localStorage.getItem(KEY) || defaultLang; }
  function setLang(l){ localStorage.setItem(KEY, l); applyLang(l); }

  function applyLang(lang){
    document.documentElement.lang = lang === 'en' ? 'en' : 'tr';
    // update simple keyed elements
    document.querySelectorAll('[data-i18n]').forEach((el)=>{
      const key = el.getAttribute('data-i18n');
      const val = (translations[lang] && translations[lang][key]);
      if (!val) return;
      if (el.placeholder !== undefined && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    });
    // update placeholders via data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el)=>{
      const key = el.getAttribute('data-i18n-placeholder');
      const val = (translations[lang] && translations[lang][key]);
      if (val) el.placeholder = val;
    });
  }

  function init(){
    const lang = getLang();
    applyLang(lang);
    // wire switcher
    document.querySelectorAll('.lang-switcher [data-lang]').forEach((btn)=>{
      btn.addEventListener('click', ()=>{
        const l = btn.getAttribute('data-lang');
        setLang(l);
        // update pressed state
        document.querySelectorAll('.lang-switcher [data-lang]').forEach(b=>b.setAttribute('aria-pressed', b.getAttribute('data-lang')===l));
      });
      // mark pressed initial
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang')===lang);
    });

    // Expose simple t() for other scripts
    window.i18n = { init, getLang, setLang, t: (k)=> (translations[getLang()]||{})[k] };
  }

  // attach early so loader can call init
  window.i18n = { init, getLang, setLang, t: (k)=> (translations[defaultLang]||{})[k] };
})();
