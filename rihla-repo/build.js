/**
 * Build script — يشتغل تلقائي وقت الرفع على Cloudflare Pages.
 * 1) بينسخ محتوى مجلد public (اللاندنج بيدج والأصول) إلى dist
 * 2) بيقرأ كل مقالات content/articles ويبني منها صفحة /blog وصفحات كل مقال
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const ARTICLES_DIR = path.join(ROOT, 'content', 'articles');
const DIST_DIR = path.join(ROOT, 'dist');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function loadArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
  const articles = files.map(file => {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    return {
      title: data.title || 'بدون عنوان',
      slug: data.slug || file.replace(/\.md$/, ''),
      category: data.category || '',
      date: data.date || '',
      published: data.published !== false,
      excerpt: data.excerpt || '',
      image: data.image || '',
      html: marked.parse(content || '')
    };
  });
  return articles
    .filter(a => a.published)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

const HEAD = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
<style>
:root{--red:#E1000F;--red-d:#B4000C;--black:#000;--white:#FFF;--off:#F7F7F7;--text:#0A0A0A;--text-m:#4A4A4A;--text-s:#8A8A8A;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Almarai',sans-serif;background:var(--white);color:var(--text);direction:rtl;line-height:1.8;}
a{color:inherit;text-decoration:none;}
.wrap{max-width:820px;margin:0 auto;padding:0 24px;}
nav{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #eee;}
.logo{font-weight:800;font-size:20px;color:var(--black);}
.logo span{color:var(--red);}
.back{font-weight:700;color:var(--red);font-size:14px;}
.hero-strip{background:var(--black);color:var(--white);padding:60px 24px 40px;text-align:center;}
.hero-strip h1{font-size:30px;font-weight:800;}
.hero-strip p{color:#aaa;margin-top:10px;font-size:15px;}
.article-card{display:block;padding:28px 0;border-bottom:1px solid #eee;}
.article-card .cat{display:inline-block;background:var(--red);color:var(--white);font-size:12px;font-weight:800;padding:4px 12px;border-radius:20px;margin-bottom:10px;}
.article-card h2{font-size:21px;font-weight:800;margin-bottom:8px;}
.article-card p{color:var(--text-m);font-size:15px;}
.article-card .date{color:var(--text-s);font-size:13px;margin-top:8px;display:block;}
.article-body{padding:40px 0 80px;}
.article-body .cat{display:inline-block;background:var(--red);color:var(--white);font-size:12px;font-weight:800;padding:4px 12px;border-radius:20px;margin-bottom:16px;}
.article-body h1{font-size:32px;font-weight:800;margin-bottom:10px;}
.article-body .date{color:var(--text-s);font-size:13px;margin-bottom:30px;display:block;}
.article-body img{max-width:100%;border-radius:12px;margin:20px 0;}
.article-body h2{font-size:22px;font-weight:800;margin:28px 0 12px;}
.article-body p{color:var(--text-m);font-size:16px;margin-bottom:14px;}
.cta-box{background:var(--off);border-radius:16px;padding:28px;text-align:center;margin-top:40px;}
.cta-box p{font-weight:800;font-size:17px;margin-bottom:16px;color:var(--text);}
.cta-btn{display:inline-block;background:var(--red);color:var(--white);font-weight:800;padding:14px 32px;border-radius:50px;}
footer{text-align:center;padding:30px;color:var(--text-s);font-size:13px;border-top:1px solid #eee;margin-top:40px;}
</style>`;

const NAV = `<nav>
  <a href="/" class="logo">رحلة<span>.</span></a>
  <a href="/blog/" class="back">المدونة</a>
</nav>`;

const FOOTER = `<footer>© ${new Date().getFullYear()} رحلة للتسويق الرقمي — جميع الحقوق محفوظة</footer>`;

function page(title, body) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><title>${title}</title>${HEAD}</head>
<body>
${NAV}
${body}
${FOOTER}
</body>
</html>`;
}

function buildBlogIndex(articles) {
  const cards = articles.map(a => `
  <a href="/blog/${a.slug}/" class="article-card">
    ${a.category ? `<span class="cat">${a.category}</span>` : ''}
    <h2>${a.title}</h2>
    <p>${a.excerpt}</p>
    ${a.date ? `<span class="date">${a.date}</span>` : ''}
  </a>`).join('\n');

  const body = `
  <div class="hero-strip">
    <h1>مدونة رحلة</h1>
    <p>مقالات ونصائح في التسويق الرقمي وتنمية المتاجر الإلكترونية</p>
  </div>
  <div class="wrap">
    ${cards || '<p style="padding:40px 0;color:#999;">لا توجد مقالات منشورة بعد.</p>'}
  </div>`;

  return page('مدونة رحلة', body);
}

function buildArticlePage(a) {
  const body = `
  <div class="wrap article-body">
    ${a.category ? `<span class="cat">${a.category}</span>` : ''}
    <h1>${a.title}</h1>
    ${a.date ? `<span class="date">${a.date}</span>` : ''}
    ${a.image ? `<img src="${a.image}" alt="${a.title}">` : ''}
    ${a.html}
    <div class="cta-box">
      <p>عايز نتائج زي دي لمتجرك؟</p>
      <a href="/#contact" class="cta-btn">احجز استشارة مجانية ←</a>
    </div>
  </div>`;
  return page(a.title, body);
}

// ---- run build ----
fs.rmSync(DIST_DIR, { recursive: true, force: true });
copyDir(PUBLIC_DIR, DIST_DIR);

const articles = loadArticles();

const blogDir = path.join(DIST_DIR, 'blog');
fs.mkdirSync(blogDir, { recursive: true });
fs.writeFileSync(path.join(blogDir, 'index.html'), buildBlogIndex(articles));

for (const a of articles) {
  const artDir = path.join(blogDir, a.slug);
  fs.mkdirSync(artDir, { recursive: true });
  fs.writeFileSync(path.join(artDir, 'index.html'), buildArticlePage(a));
}

console.log(`Built ${articles.length} article(s) into /dist/blog`);
