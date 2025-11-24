// server.js - Deploy di Render.com, Railway.app, atau VPS
const express = require('express');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint untuk scrape invoices
app.get('/scrape-invoices', async (req, res) => {
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Navigate dan tunggu JavaScript selesai
    await page.goto('https://khatulistiwanet.unaux.com/invoices.php', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Tunggu redirect selesai (dari JavaScript)
    await page.waitForTimeout(3000);
    
    // Ambil content final
    const content = await page.content();
    
    await browser.close();
    
    // Return HTML content
    res.setHeader('Content-Type', 'text/html');
    res.send(content);
    
  } catch (error) {
    if (browser) await browser.close();
    
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'puppeteer-scraper' });
});

app.listen(PORT, () => {
  console.log(`Puppeteer server running on port ${PORT}`);
});
