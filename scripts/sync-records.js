/**
 * CleanRoom Writer | Automated Sympathy-Ranked Records Sync
 * 
 * Protocol:
 * 1. Scans all posts from Naver Blog (humi09) via mobile API
 * 2. Ranks posts strictly by sympathy count (sympathyCnt) descending
 * 3. Extracts TOP 6 records with highest audit trail response
 * 4. Injects updated records into index.html and script.js (SSG)
 * 5. Saves records.json for audit trail history
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BLOG_ID = 'humi09';
const ROOT_DIR = path.resolve(__dirname, '..');
const INDEX_HTML = path.join(ROOT_DIR, 'index.html');
const SCRIPT_JS = path.join(ROOT_DIR, 'script.js');
const RECORDS_JSON = path.join(ROOT_DIR, 'records.json');

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function fetchPage(page) {
  return new Promise((resolve) => {
    const url = `https://m.blog.naver.com/api/blogs/${BLOG_ID}/post-list?categoryNo=0&itemCount=30&page=${page}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        'Referer': `https://m.blog.naver.com/${BLOG_ID}`
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          resolve(json.result && json.result.items ? json.result.items : []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', (err) => {
      console.error(`Page ${page} error:`, err.message);
      resolve([]);
    });
  });
}

async function fetchAllPosts() {
  let all = [];
  for (let page = 1; page <= 6; page++) {
    const items = await fetchPage(page);
    if (!items || items.length === 0) break;
    all.push(...items);
    if (items.length < 30) break;
  }
  return all;
}

function cleanExcerpt(text) {
  if (!text) return '';
  let cleaned = decodeHtml(text);
  // Cut down to around 110 chars with ellipsis
  if (cleaned.length > 120) {
    cleaned = cleaned.substring(0, 115) + '...';
  }
  return cleaned;
}

function cleanTitle(raw) {
  let t = decodeHtml(raw);
  return t;
}

async function main() {
  console.log('[CLEANROOM PROTOCOL] Fetching Naver Blog posts for:', BLOG_ID);
  const posts = await fetchAllPosts();
  console.log(`[CLEANROOM PROTOCOL] Scanned total ${posts.length} posts.`);

  if (posts.length === 0) {
    console.error('[ERROR] No posts fetched. Aborting to protect existing data.');
    process.exit(1);
  }

  // Sort by sympathyCnt desc, then addDate desc
  posts.sort((a, b) => {
    const diff = (b.sympathyCnt || 0) - (a.sympathyCnt || 0);
    if (diff !== 0) return diff;
    return (b.addDate || 0) - (a.addDate || 0);
  });

  const top6 = posts.slice(0, 6);
  console.log('\n[TOP 6 SYMPATHY RANKINGS]');
  top6.forEach((p, idx) => {
    console.log(`REC. 0${idx + 1} | [공감 ${p.sympathyCnt}] ${cleanTitle(p.titleWithInspectMessage)}`);
  });

  // 1. Build records.json
  const recordsData = top6.map((p, idx) => {
    const id = idx + 1;
    const recId = `REC. 0${id}`;
    const title = cleanTitle(p.titleWithInspectMessage);
    const desc = cleanExcerpt(p.briefContents);
    const link = `https://blog.naver.com/${BLOG_ID}/${p.logNo}`;
    const sympathy = p.sympathyCnt || 0;
    const category = p.categoryName || 'GMP in Your Area';
    
    // Tag formatting
    const tag = `AUDIT TRAIL / 공감 ${sympathy}`;

    return {
      id,
      recId,
      logNo: p.logNo,
      title,
      tag,
      desc,
      category,
      sympathy,
      commentCnt: p.commentCnt || 0,
      link,
      addDate: p.addDate
    };
  });

  fs.writeFileSync(RECORDS_JSON, JSON.stringify({
    lastSynced: new Date().toISOString(),
    totalScanned: posts.length,
    records: recordsData
  }, null, 2), 'utf-8');
  console.log('\n[UPDATED] records.json');

  // 2. Generate HTML for records-list
  let recordsHtml = '        <div class="records-list">\n';
  recordsData.forEach(r => {
    recordsHtml += `          <!-- ${r.recId} -->\n`;
    recordsHtml += `          <article class="record-row" data-record-id="${r.id}">\n`;
    recordsHtml += `            <div class="record-meta">\n`;
    recordsHtml += `              <span class="system-token record-id">${r.recId}</span>\n`;
    recordsHtml += `              <span class="system-token record-tag">${r.tag}</span>\n`;
    recordsHtml += `            </div>\n`;
    recordsHtml += `            <div class="record-main">\n`;
    recordsHtml += `              <h3 class="record-title">${r.title}</h3>\n`;
    recordsHtml += `              <p class="record-desc">${r.desc}</p>\n`;
    recordsHtml += `            </div>\n`;
    recordsHtml += `            <div class="record-action">\n`;
    recordsHtml += `              <span class="system-token action-text">REPORT ↗</span>\n`;
    recordsHtml += `            </div>\n`;
    recordsHtml += `          </article>\n\n`;
  });
  recordsHtml += '        </div>';

  // Inject into index.html
  let indexContent = fs.readFileSync(INDEX_HTML, 'utf-8');
  const recordsRegex = /[ \t]*<div class="records-list">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;
  if (recordsRegex.test(indexContent)) {
    indexContent = indexContent.replace(recordsRegex, `${recordsHtml}\n      </div>\n    </section>`);
    fs.writeFileSync(INDEX_HTML, indexContent, 'utf-8');
    console.log('[UPDATED] index.html records section');
  } else {
    console.warn('[WARN] records-list regex match failed in index.html');
  }

  // 3. Update qcArchive in script.js
  let scriptContent = fs.readFileSync(SCRIPT_JS, 'utf-8');
  
  let qcArchiveObj = {};
  recordsData.forEach(r => {
    qcArchiveObj[r.id] = {
      recId: r.recId,
      title: r.title,
      abstract: `[${r.category}] 공감 데이터 ${r.sympathy}건 입증 기록`,
      hypothesis: `“${r.title}”`,
      observation: `${r.desc} (현업 19년 QC 렌즈로 관측 및 입증)`,
      link: r.link
    };
  });

  const archiveRegex = /const qcArchive = \{[\s\S]*?\n\};/;
  const newArchiveStr = `const qcArchive = ${JSON.stringify(qcArchiveObj, null, 2)};`;
  if (archiveRegex.test(scriptContent)) {
    scriptContent = scriptContent.replace(archiveRegex, newArchiveStr);
    fs.writeFileSync(SCRIPT_JS, scriptContent, 'utf-8');
    console.log('[UPDATED] script.js qcArchive');
  } else {
    console.warn('[WARN] qcArchive regex match failed in script.js');
  }

  console.log('\n[SUCCESS] CleanRoom sync completed successfully.');
}

main();
