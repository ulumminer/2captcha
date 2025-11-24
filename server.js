// server.js - Deploy di Render.com
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 10000;

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'puppeteer-scraper' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'puppeteer-scraper' });
});

// Endpoint untuk scrape invoices
app.get('/scrape-invoices', async (req, res) => {
  let browser;
  
  try {
    // Launch browser dengan config untuk Render
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
    });
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate dan tunggu JavaScript selesai
    await page.goto('https://khatulistiwanet.unaux.com/invoices.php', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Tunggu redirect selesai (dari JavaScript challenge)
    await page.waitForTimeout(3000);
    
    // Ambil content final
    const content = await page.content();
    
    await browser.close();
    
    // Return HTML content
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(content);
    
  } catch (error) {
    if (browser) await browser.close();
    
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

app.listen(PORT, () => {
  console.log(`Puppeteer server running on port ${PORT}`);
});
