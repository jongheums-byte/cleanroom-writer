/**
 * CleanRoom Writer | GEO & Static Archive Mirroring Protocol
 *
 * 1. Fetches all posts from Naver Blog (humi09)
 * 2. Selects core technical & high-response posts (CleanRoom AI, LabTalk, Top GMP essays)
 * 3. Incrementally extracts clean semantic content into /archive/{logNo}.html with JSON-LD
 * 4. Builds /archive/index.html (searchable & filterable archive hub)
 * 5. Generates /llms.txt (AI Search / GEO index) and /sitemap.xml
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const {
  BLOG_ID,
  SITE_URL,
  ROOT_DIR,
  decodeHtml,
  fetchAllPosts,
  cleanExcerpt,
  cleanTitle
} = require('./sync-records');

const ARCHIVE_DIR = path.join(ROOT_DIR, 'archive');
const ARCHIVE_INDEX = path.join(ARCHIVE_DIR, 'index.html');
const ARCHIVE_DATA_JSON = path.join(ARCHIVE_DIR, 'archive-index.json');
const LLMS_TXT = path.join(ROOT_DIR, 'llms.txt');
const SITEMAP_XML = path.join(ROOT_DIR, 'sitemap.xml');

const FORCE_REFRESH = process.argv.includes('--force');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripTags(html) {
  if (!html) return '';
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\u200B/g, '')
  ).trim();
}

function formatDateISO(ms) {
  if (!ms) return new Date().toISOString().split('T')[0];
  return new Date(ms).toISOString().split('T')[0];
}

function fetchPostHtml(logNo) {
  return new Promise((resolve) => {
    const url = `https://m.blog.naver.com/${BLOG_ID}/${logNo}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        'Referer': `https://m.blog.naver.com/${BLOG_ID}`
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', () => resolve(''));
  });
}

function extractSemanticContent(rawHtml) {
  if (!rawHtml) return { html: '', plainText: '' };

  const startIdx = rawHtml.indexOf('class="se-main-container"');
  if (startIdx === -1) return { html: '', plainText: '' };

  let container = rawHtml.slice(startIdx);
  const endMarker = container.indexOf('<!-- //SE_MAIN_CONTAINER -->');
  if (endMarker !== -1) {
    container = container.slice(0, endMarker);
  } else {
    const postTagIdx = container.indexOf('<div class="post_tag');
    if (postTagIdx !== -1) container = container.slice(0, postTagIdx);
  }

  // Split by se-component blocks
  const parts = container.split(/<div[^>]*class="se-component\s+/);
  const htmlBlocks = [];
  const textBlocks = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const typeMatch = part.match(/^(se-[a-zA-Z0-9_-]+)/);
    const compType = typeMatch ? typeMatch[1] : '';

    if (compType === 'se-documentTitle' || compType === 'se-oglink' || compType === 'se-sticker') {
      continue;
    }

    if (compType === 'se-horizontalLine') {
      htmlBlocks.push('<hr class="article-divider">');
      continue;
    }

    if (compType === 'se-quotation') {
      const paras = [...part.matchAll(/<p[^>]*class="se-text-paragraph[^"]*"[^>]*>([\s\S]*?)<\/p>/g)]
        .map(m => stripTags(m[1]))
        .filter(Boolean);
      if (paras.length > 0) {
        htmlBlocks.push(`<blockquote>${paras.map(p => `<p>${escapeHtml(p)}</p>`).join('')}</blockquote>`);
        textBlocks.push(paras.join(' '));
      }
      continue;
    }

    if (compType === 'se-table') {
      const rows = [...part.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
      if (rows.length > 0) {
        let tableHtml = '<div class="table-wrap"><table>';
        rows.forEach((r, rIdx) => {
          const cells = [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)]
            .map(c => stripTags(c[1]).replace(/\n+/g, ' '));
          if (cells.length > 0) {
            const tag = rIdx === 0 ? 'th' : 'td';
            if (rIdx === 0) tableHtml += '<thead>';
            if (rIdx === 1) tableHtml += '<tbody>';
            tableHtml += `<tr>${cells.map(c => `<${tag}>${escapeHtml(c)}</${tag}>`).join('')}</tr>`;
            if (rIdx === 0) tableHtml += '</thead>';
          }
        });
        if (rows.length > 1) tableHtml += '</tbody>';
        tableHtml += '</table></div>';
        htmlBlocks.push(tableHtml);
      }
      continue;
    }

    if (compType === 'se-code') {
      const codeMatch = part.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
      const codeText = codeMatch ? stripTags(codeMatch[1]) : stripTags(part);
      if (codeText) {
        htmlBlocks.push(`<pre><code>${escapeHtml(codeText)}</code></pre>`);
        textBlocks.push(codeText);
      }
      continue;
    }

    if (compType === 'se-text') {
      const paras = [...part.matchAll(/<p[^>]*class="se-text-paragraph[^"]*"[^>]*>([\s\S]*?)<\/p>/g)];
      for (const pMatch of paras) {
        const inner = pMatch[1];
        const text = stripTags(inner);
        if (!text) continue;

        const isLarge = /se-fs-fs(2[0-9]|3[0-9]|19)/.test(inner);
        const isBold = /<b>|<strong|se-ff-/.test(inner) && text.length < 70;
        const looksLikeHeading = isLarge || (isBold && /^(\d+\.|#|\[|▶|■|STEP)/i.test(text));

        if (looksLikeHeading && text.length < 90) {
          htmlBlocks.push(`<h2>${escapeHtml(text)}</h2>`);
        } else {
          htmlBlocks.push(`<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`);
        }
        textBlocks.push(text);
      }
    }
  }

  return {
    html: htmlBlocks.join('\n      '),
    plainText: textBlocks.join('\n')
  };
}

function selectArchivePosts(posts) {
  // Select all CleanRoom AI, LabTalk, and Top 25 GMP in Your Area (or sympathy >= 3)
  const gmpTop = posts
    .filter(p => (p.categoryName || '').includes('GMP'))
    .sort((a, b) => (b.sympathyCnt || 0) - (a.sympathyCnt || 0) || (b.addDate || 0) - (a.addDate || 0))
    .slice(0, 25);
  const gmpIds = new Set(gmpTop.map(p => p.logNo));

  const top6Ids = new Set(
    [...posts]
      .sort((a, b) => (b.sympathyCnt || 0) - (a.sympathyCnt || 0) || (b.addDate || 0) - (a.addDate || 0))
      .slice(0, 6)
      .map(p => p.logNo)
  );

  return posts
    .filter(p => {
      const cat = (p.categoryName || '').replace(/\u00a0/g, ' ');
      return (
        cat.includes('CleanRoom') ||
        cat.includes('LabTalk') ||
        gmpIds.has(p.logNo) ||
        top6Ids.has(p.logNo)
      );
    })
    .sort((a, b) => (b.addDate || 0) - (a.addDate || 0));
}

function buildArticleHtml(post, bodyHtml) {
  const title = cleanTitle(post.titleWithInspectMessage);
  const desc = cleanExcerpt(post.briefContents) || title;
  const cat = (post.categoryName || 'Archive').replace(/\u00a0/g, ' ').trim();
  const dateStr = formatDateISO(post.addDate);
  const naverUrl = `https://blog.naver.com/${BLOG_ID}/${post.logNo}`;
  const canonicalUrl = `${SITE_URL}/archive/${post.logNo}.html`;
  const schemaType = cat.includes('CleanRoom') || cat.includes('LabTalk') ? 'TechArticle' : 'Article';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: title,
    description: desc,
    datePublished: dateStr,
    dateModified: dateStr,
    inLanguage: 'ko-KR',
    articleSection: cat,
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    isBasedOn: naverUrl,
    author: {
      '@type': 'Person',
      name: 'CleanRoom Writer',
      url: SITE_URL,
      jobTitle: 'Pharmaceutical & Bio QC Specialist (19 Years Experience)'
    },
    publisher: {
      '@type': 'Organization',
      name: 'CleanRoom Writer',
      url: SITE_URL
    }
  };

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | CleanRoom Writer Archive</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" type="text/plain" title="LLM Context" href="../llms.txt">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="article:published_time" content="${dateStr}">
  <meta property="article:section" content="${escapeHtml(cat)}">

  <!-- Schema.org Structured Data (GEO) -->
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>

  <link rel="icon" type="image/x-icon" href="https://ssl.pstatic.net/static/blog/icon/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
</head>
<body class="silence-theme">
  <header class="status-bar">
    <div class="status-left">
      <a href="../index.html" class="system-token brand-token" style="text-decoration:none;">CLEANROOM WRITER</a>
    </div>
    <div class="status-right">
      <a href="index.html" class="system-token status-link">← ARCHIVE</a>
      <a href="${naverUrl}" target="_blank" rel="noopener noreferrer" class="system-token status-link">NAVER ORIGINAL ↗</a>
    </div>
  </header>

  <main class="archive-article-container">
    <article class="archive-article" itemscope itemtype="https://schema.org/${schemaType}">
      <header class="article-header">
        <div class="article-meta-bar">
          <span class="system-token record-tag">${escapeHtml(cat)}</span>
          <span class="system-token record-id">DATE: ${dateStr}</span>
          <span class="system-token record-id">SYMPATHY: ${post.sympathyCnt || 0}</span>
        </div>
        <h1 class="article-title" itemprop="headline">${escapeHtml(title)}</h1>
        <p class="article-lead" itemprop="description">${escapeHtml(desc)}</p>
      </header>

      <div class="article-body" itemprop="articleBody">
      ${bodyHtml || `<p>${escapeHtml(desc)}</p>`}
      </div>

      <footer class="article-footer">
        <div class="article-source-box">
          <span class="system-token">SOURCE VERIFICATION / AUDIT TRAIL</span>
          <p>이 문서는 네이버 블로그 <strong>CleanRoom Writer</strong>의 원문을 AI 검색(GEO) 및 정적 웹 아카이브용으로 규격화한 미러링 문서입니다.</p>
          <div class="article-footer-actions">
            <a href="${naverUrl}" target="_blank" rel="noopener noreferrer" class="cta-primary">
              <span>네이버 블로그 원문 보기</span>
              <span class="cta-arrow" aria-hidden="true">↗</span>
            </a>
            <a href="index.html" class="cta-secondary">
              <span>전체 아카이브 목록</span>
            </a>
          </div>
        </div>
      </footer>
    </article>
  </main>

  <footer class="silence-footer">
    <div class="footer-inner">
      <span class="system-token footer-tag">AIR PURITY 99.9% • GEO ARCHIVE MIRROR</span>
      <span class="system-token footer-copy">© 2026 CLEANROOM WRITER. ALL RIGHTS RESERVED.</span>
    </div>
  </footer>
</body>
</html>`;
}

function buildArchiveIndexHtml(selectedPosts) {
  const itemsHtml = selectedPosts.map(p => {
    const title = cleanTitle(p.titleWithInspectMessage);
    const desc = cleanExcerpt(p.briefContents);
    const cat = (p.categoryName || 'Archive').replace(/\u00a0/g, ' ').trim();
    const dateStr = formatDateISO(p.addDate);
    let catKey = 'gmp';
    if (cat.includes('CleanRoom')) catKey = 'ai';
    else if (cat.includes('LabTalk')) catKey = 'lab';

    return `        <article class="record-row archive-item" data-category="${catKey}" data-search="${escapeHtml((title + ' ' + desc + ' ' + cat).toLowerCase())}">
          <div class="record-meta">
            <span class="system-token record-id">${dateStr}</span>
            <span class="system-token record-tag">${escapeHtml(cat)} / 공감 ${p.sympathyCnt || 0}</span>
          </div>
          <div class="record-main">
            <h2 class="record-title"><a href="${p.logNo}.html" class="archive-item-link">${escapeHtml(title)}</a></h2>
            <p class="record-desc">${escapeHtml(desc)}</p>
          </div>
          <div class="record-action">
            <a href="${p.logNo}.html" class="system-token action-text" style="text-decoration:none;">READ ↗</a>
          </div>
        </article>`;
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Archive | CleanRoom Writer GEO Knowledge Base</title>
  <meta name="description" content="제약·바이오 QC 19년 전문가 CleanRoom Writer의 핵심 기술 아티클, AI 실전 바이브코딩, GMP 조직론 정적 아카이브.">
  <link rel="canonical" href="${SITE_URL}/archive/">
  <link rel="alternate" type="text/plain" title="LLM Context" href="../llms.txt">
  <link rel="icon" type="image/x-icon" href="https://ssl.pstatic.net/static/blog/icon/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
</head>
<body class="silence-theme">
  <header class="status-bar">
    <div class="status-left">
      <a href="../index.html" class="system-token brand-token" style="text-decoration:none;">CLEANROOM WRITER</a>
    </div>
    <div class="status-right">
      <a href="../index.html" class="system-token status-link">← HOME</a>
      <a href="../llms.txt" class="system-token status-link">LLMS.TXT</a>
      <a href="https://blog.naver.com/humi09" target="_blank" rel="noopener noreferrer" class="system-token status-link">BLOG ↗</a>
    </div>
  </header>

  <main class="archive-index-container">
    <section class="archive-hero">
      <div class="system-token section-code">[ GEO STATIC ARCHIVE / ${selectedPosts.length} RECORDS ]</div>
      <h1 class="records-title" style="margin-bottom: 16px;">기술 및 본질 아카이브</h1>
      <p class="manifesto-sub" style="margin-bottom: 32px;">
        네이버 블로그의 핵심 기술 연재(CleanRoom AI, LabTalk)와 고공감 GMP 에세이를<br>
        시맨틱 HTML5 및 구조화 데이터(JSON-LD) 규격으로 정적 미러링한 공식 지식 베이스입니다.
      </p>

      <div class="archive-controls">
        <div class="archive-filters" role="tablist">
          <button class="filter-btn active" data-filter="all">ALL (${selectedPosts.length})</button>
          <button class="filter-btn" data-filter="ai">CLEANROOM AI</button>
          <button class="filter-btn" data-filter="gmp">GMP IN YOUR AREA</button>
          <button class="filter-btn" data-filter="lab">LABTALK</button>
        </div>
        <input type="search" id="archiveSearch" class="archive-search-input" placeholder="키워드 검색 (예: GPT, SST, 바이브코딩, 데이터)..." aria-label="아카이브 검색">
      </div>
    </section>

    <section class="records-list" id="archiveList">
${itemsHtml}
    </section>
  </main>

  <footer class="silence-footer">
    <div class="footer-inner">
      <span class="system-token footer-tag">AIR PURITY 99.9% • ZERO CONTAMINATION</span>
      <span class="system-token footer-copy">© 2026 CLEANROOM WRITER. ALL RIGHTS RESERVED.</span>
    </div>
  </footer>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const buttons = document.querySelectorAll('.filter-btn');
      const searchInput = document.getElementById('archiveSearch');
      const items = document.querySelectorAll('.archive-item');
      let currentFilter = 'all';

      function applyFilter() {
        const query = (searchInput.value || '').trim().toLowerCase();
        items.forEach(item => {
          const cat = item.getAttribute('data-category');
          const text = item.getAttribute('data-search') || '';
          const matchCat = currentFilter === 'all' || cat === currentFilter;
          const matchQuery = !query || text.includes(query);
          item.style.display = (matchCat && matchQuery) ? '' : 'none';
        });
      }

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFilter = btn.getAttribute('data-filter');
          applyFilter();
        });
      });

      searchInput.addEventListener('input', applyFilter);
    });
  </script>
</body>
</html>`;
}

function buildLlmsTxt(selectedPosts) {
  const lines = [
    '# CleanRoom Writer',
    '',
    '> 제약·바이오 품질관리(QC) 현업 19년 전문가가 GMP 원칙, 데이터 완전성(Data Integrity), 시스템 적합성(SST), 조직 거버넌스, 그리고 생성형 AI 바이브코딩 실전 노하우를 기록하는 공식 기술 아카이브입니다.',
    '',
    `- Official Hub: ${SITE_URL}/`,
    `- Full Static Archive: ${SITE_URL}/archive/`,
    `- Original Naver Blog: https://blog.naver.com/${BLOG_ID}`,
    `- Author: CleanRoom Writer (19 Yrs Pharmaceutical & Bio QC Specialist)`,
    '',
    '## Core Domains',
    '- GMP in Your Area: 제약 품질보증·품질관리 원칙(GPT, AMT, SST, 세척 밸리데이션, Blank, Quality Agreement)을 조직 관리와 업무 본질에 투영한 분석 에세이',
    '- CleanRoom AI: 비전공자 현업 전문가의 생성형 AI 바이브코딩, 코드 기반 영상/웹 제작(HyperFrames, Remotion, Netlify), 컨텍스트 엔지니어링 실전 가이드',
    '- LabTalk: 분석기기, 실험실 실무 및 QC 기술 브리핑',
    '',
    `## Mirrored Technical & Core Articles (${selectedPosts.length})`,
    ''
  ];

  selectedPosts.forEach(p => {
    const title = cleanTitle(p.titleWithInspectMessage);
    const desc = cleanExcerpt(p.briefContents);
    const cat = (p.categoryName || 'Archive').replace(/\u00a0/g, ' ').trim();
    const dateStr = formatDateISO(p.addDate);
    lines.push(`- [${title}](${SITE_URL}/archive/${p.logNo}.html) (${cat}, ${dateStr}, 공감 ${p.sympathyCnt || 0}): ${desc}`);
  });

  return lines.join('\n') + '\n';
}

function buildSitemapXml(selectedPosts) {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: today, priority: '1.0' },
    { loc: `${SITE_URL}/archive/`, lastmod: today, priority: '0.9' }
  ];

  selectedPosts.forEach(p => {
    urls.push({
      loc: `${SITE_URL}/archive/${p.logNo}.html`,
      lastmod: formatDateISO(p.addDate),
      priority: '0.8'
    });
  });

  const entries = urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

async function main() {
  console.log('[GEO ARCHIVE] Scanning all posts from Naver Blog:', BLOG_ID);
  const allPosts = await fetchAllPosts();
  if (allPosts.length === 0) {
    console.error('[ERROR] No posts fetched. Aborting.');
    process.exit(1);
  }

  const selected = selectArchivePosts(allPosts);
  console.log(`[GEO ARCHIVE] Selected ${selected.length} core/technical posts out of ${allPosts.length}.`);

  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }

  // Incremental mirror: only fetch posts not yet generated (or when --force is passed)
  const toFetch = selected.filter(p => {
    const filePath = path.join(ARCHIVE_DIR, `${p.logNo}.html`);
    return FORCE_REFRESH || !fs.existsSync(filePath);
  });

  console.log(`[GEO ARCHIVE] Fetching full body for ${toFetch.length} posts (skipping ${selected.length - toFetch.length} cached)...`);

  const CONCURRENCY = 5;
  for (let i = 0; i < toFetch.length; i += CONCURRENCY) {
    const batch = toFetch.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async post => {
        const rawHtml = await fetchPostHtml(post.logNo);
        const { html } = extractSemanticContent(rawHtml);
        const fullHtml = buildArticleHtml(post, html);
        fs.writeFileSync(path.join(ARCHIVE_DIR, `${post.logNo}.html`), fullHtml, 'utf-8');
      })
    );
    console.log(`[GEO ARCHIVE] Progress: ${Math.min(i + CONCURRENCY, toFetch.length)} / ${toFetch.length}`);
  }

  // Always regenerate archive/index.html, archive-index.json, llms.txt, sitemap.xml
  fs.writeFileSync(ARCHIVE_INDEX, buildArchiveIndexHtml(selected), 'utf-8');
  fs.writeFileSync(
    ARCHIVE_DATA_JSON,
    JSON.stringify({ lastSynced: new Date().toISOString(), count: selected.length, posts: selected.map(p => ({ logNo: p.logNo, title: cleanTitle(p.titleWithInspectMessage), category: (p.categoryName || '').replace(/\u00a0/g, ' ').trim(), sympathy: p.sympathyCnt || 0, date: formatDateISO(p.addDate) })) }, null, 2),
    'utf-8'
  );
  fs.writeFileSync(LLMS_TXT, buildLlmsTxt(selected), 'utf-8');
  fs.writeFileSync(SITEMAP_XML, buildSitemapXml(selected), 'utf-8');

  console.log('[UPDATED] archive/index.html, llms.txt, sitemap.xml');
  console.log('[SUCCESS] GEO Static Archive synchronization completed.');
}

if (require.main === module) {
  main();
}
