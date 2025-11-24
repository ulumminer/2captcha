export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/invoices' || url.pathname === '/') {
      try {
        // GANTI INI dengan URL Puppeteer server lo
        const PUPPETEER_SERVER = 'https://your-puppeteer-server.onrender.com';
        
        // Fetch via Puppeteer server
        const response = await fetch(`${PUPPETEER_SERVER}/scrape-invoices`, {
          headers: {
            'Accept': 'text/html'
          },
          cf: {
            cacheTtl: 60,
            cacheEverything: true
          }
        });
        
        if (!response.ok) {
          throw new Error(`Puppeteer server error: ${response.status}`);
        }
        
        const data = await response.text();
        
        return new Response(data, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60'
          }
        });
        
      } catch (error) {
        return new Response(`
Error: ${error.message}

Setup Instructions:
===================
1. Deploy Puppeteer server (lihat artifact 'Puppeteer Server')
2. Update PUPPETEER_SERVER variable di Worker ini
3. Test: /tool fetch url="https://mikrotik-gw.ulumtea-ulum.workers.dev/invoices" output=user

Deployment Options:
- Render.com (Free tier, auto-deploy from GitHub)
- Railway.app (Free $5/month credit)
- Fly.io (Free tier available)
- Your own VPS

        `, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
    
    // Help
    return new Response(`
MikroTik Gateway Worker
======================
Status: Waiting for Puppeteer server setup

Endpoint: /invoices

Setup required:
1. Deploy Puppeteer server
2. Update Worker configuration
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
