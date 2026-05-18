# Pixware Studios Website

Pixware Studios tanitim sitesi — oyun vitrini, launcher, haberler, kariyer, ekip ve **admin paneli**.

## Yerel calistirma

```bash
cd pixware-website
python3 -m http.server 8080
```

- Site: http://localhost:8080  
- Admin: http://localhost:8080/admin.html  

`file://` ile acmayin; JSON ve partials icin sunucu gerekir.

## Admin paneli

| Alan | Aciklama |
|------|----------|
| URL | `/admin.html` |
| Varsayilan sifre | `pixware2026` |
| Sifre degistirme | `js/config.js` → `adminPasswordHash` |

Yeni sifre hash'i (tarayici konsolu, admin sayfasindayken):

```js
hashPassword('yeni-sifreniz').then(console.log)
```

Cikan degeri `adminPasswordHash` alanina yapistirin.

### Admin ozellikleri

- **Site** — vizyon, slogan, iletisim, sosyal linkler  
- **Ekip** — uyeler (ad, rol, bio, emoji, sosyal)  
- **Oyunlar / Haberler / Kariyer** — CRUD  
- **GitHub Yayin** — tum `data/*.json` dosyalarini repo'ya gonderir  
- **JSON indir** — manuel commit icin dosya export  

### GitHub Token

1. GitHub → Settings → Developer settings → Personal access tokens  
2. `repo` izni (private repo ise)  
3. Admin → GitHub sekmesi: owner, repo adi, dal (`master` veya `main`), token  
4. **Tum icerigi GitHub'a gonder**

## GitHub Pages yayini

### 1. Repoya bagla

```bash
git remote add origin https://github.com/KULLANICI/pixware-website.git
git add .
git commit -m "Pixware Studios site + admin + GitHub Pages"
git push -u origin master
```

### 2. Pages ayari

Repo → **Settings** → **Pages** → Build and deployment:

- **Source:** GitHub Actions  

`/.github/workflows/deploy.yml` push sonrasi otomatik deploy eder.

### 3. Canli URL

- Proje sitesi: `https://KULLANICI.github.io/pixware-website/`  
- Ozel domain: Settings → Pages → Custom domain → `www.pixwarestudios.com`

## Icerik dosyalari

| Dosya | Icerik |
|-------|--------|
| `data/games.json` | Oyunlar |
| `data/posts.json` | Haberler |
| `data/jobs.json` | Is ilanlari |
| `data/team.json` | Ekip |
| `data/site.json` | Vizyon, hero, sosyal |
| `data/launcher.json` | Launcher surum / indirme |

## Newsletter (Formspree)

`js/config.js` icinde `formspreeNewsletter` ve `formspreeContact` alanlarina form ID ekleyin. Bos birakilirsa `mailto:` kullanilir.

## Launcher

Hazir kurulum paketi yok. Kaynak: `../PixwareLauncher` — `npm install && npm start`

## Guvenlik notu

Admin sifresi istemci tarafindadir; gercek guvenlik icin repo private tutun veya ileride backend ekleyin. `admin.html` robots.txt ile indekslenmez.

## Lisans

Proprietary © Pixware Studios
# pixwarestudios
# pixwarestudios
