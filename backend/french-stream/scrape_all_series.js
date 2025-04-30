// Script Node.js pour scraper toutes les séries French-Stream
// Place ce fichier dans client/backend/french-stream/scrape_all_series.js

import { launch } from 'puppeteer';
import { writeFileSync } from 'fs';
import { load } from 'cheerio';

const BASE_URL = 'https://fsmirror41.lol/s-tv/page/';
const START_PAGE = 1;
const END_PAGE = 593; // Met à jour si besoin
const OUTPUT_FILE = 'frenchstream_data.json';

(async () => {
  const browser = await launch({ headless: false });
  const page = await browser.newPage();
  let allSeries = [];

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const BATCH_SIZE = 10;

  for (let batchStart = START_PAGE; batchStart <= END_PAGE; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, END_PAGE);
    const batchPromises = [];

    for (let i = batchStart; i <= batchEnd; i++) {
      const url = `${BASE_URL}${i}/`;
      batchPromises.push(
        (async () => {
          console.log(`Scraping page ${i}...`);
          try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await new Promise(res => setTimeout(res, 2000));
            if (i === 1) {
              const html = await page.content();
              writeFileSync('debug_page1.html', html, 'utf-8');
              await page.screenshot({ path: 'debug_page1.png' });
            }
            const html = await page.content();
            const $ = load(html);
            $('div.short.serie').each((_, el) => {
              const anchor = $(el).find('a.short-poster');
              // Le vrai titre est dans le div.short-title
              const title = $(el).find('div.short-title').text().trim();
              let serieUrl = anchor.attr('href');
              let posterUrl = anchor.find('img').attr('src');
              let id = '';
              if (serieUrl) {
                const match = serieUrl.match(/(\d+)[^/]*\.html$/);
                if (match) {
                  id = match[1];
                } else {
                  id = serieUrl.split('/').pop().replace('.html', '');
                }
              }
              if (serieUrl && !serieUrl.startsWith('http')) {
                serieUrl = BASE_URL.replace(/\/s-tv\/page\/$/, '') + serieUrl;
              }
              if (posterUrl && !posterUrl.startsWith('http')) {
                posterUrl = BASE_URL.replace(/\/s-tv\/page\/$/, '') + posterUrl;
              }
              if (id && title && serieUrl && posterUrl) {
                allSeries.push({
                  id,
                  title,
                  url: serieUrl,
                  posterUrl
                });
              }
            });
            await page.close();
          } catch (err) {
            console.error(`Erreur sur la page ${i}:`, err.message);
          }
        })()
      );
    }
    await Promise.all(batchPromises);
  }

  await browser.close();
  writeFileSync(OUTPUT_FILE, JSON.stringify({ series: allSeries }, null, 2), 'utf-8');
  console.log(`Scraping terminé. ${allSeries.length} séries extraites.`);
})();