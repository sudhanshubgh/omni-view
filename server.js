import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Proxy endpoint to allow embedding sites that set X-Frame-Options or restrictive CSP
app.get('/api/proxy', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  // Extract custom sub-browser context and location parameters
  const customUserAgent = req.query.user_agent || req.headers['x-user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  const customClientIp = req.query.client_ip || req.headers['x-client-ip'] || '198.51.100.45';
  const customCountry = req.query.country_code || req.headers['x-country-code'] || 'US';
  const customLang = req.query.lang || req.headers['x-accept-language'] || 'en-US,en;q=0.9';
  const customLat = req.query.lat || '40.7128';
  const customLng = req.query.lng || '-74.0060';
  const customPlatform = req.query.platform || 'Win32';

  try {
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    } catch {
      return res.status(400).send('Invalid URL format');
    }

    const fetchHeaders = {
      'User-Agent': customUserAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': customLang,
      'X-Forwarded-For': customClientIp,
      'X-Real-IP': customClientIp,
      'CF-IPCountry': customCountry,
      'X-Geo-Country': customCountry
    };

    const response = await fetch(parsedUrl.toString(), {
      headers: fetchHeaders,
      redirect: 'follow'
    });

    const contentType = response.headers.get('content-type') || '';

    // Copy response headers except frame-blocking ones
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== 'x-frame-options' &&
        lowerKey !== 'content-security-policy' &&
        lowerKey !== 'frame-ancestors' &&
        lowerKey !== 'content-encoding' &&
        lowerKey !== 'content-length'
      ) {
        try {
          res.setHeader(key, value);
        } catch {}
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Proxied-By', 'OmniView-Browser');
    res.setHeader('X-SubBrowser-Location-IP', customClientIp);

    if (contentType.includes('text/html')) {
      let html = await response.text();
      
      // Inject <base> tag to resolve relative assets, scripts, and links correctly
      const baseTag = `<base href="${parsedUrl.origin}${parsedUrl.pathname}" target="_blank">`;
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}`);
      } else if (html.includes('<HEAD>')) {
        html = html.replace('<HEAD>', `<HEAD>${baseTag}`);
      } else {
        html = `${baseTag}${html}`;
      }

      const scriptInjector = `
        <script>
          (function() {
            try {
              const ua = ${JSON.stringify(customUserAgent)};
              const plat = ${JSON.stringify(customPlatform)};
              const lang = ${JSON.stringify(customLang.split(',')[0])};
              const lat = ${parseFloat(customLat)};
              const lng = ${parseFloat(customLng)};
              
              Object.defineProperty(navigator, 'userAgent', { get: () => ua, configurable: true });
              Object.defineProperty(navigator, 'platform', { get: () => plat, configurable: true });
              Object.defineProperty(navigator, 'language', { get: () => lang, configurable: true });
              Object.defineProperty(navigator, 'languages', { get: () => [lang], configurable: true });

              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition = function(success) {
                  if (typeof success === 'function') {
                    success({
                      coords: {
                        latitude: lat,
                        longitude: lng,
                        accuracy: 15,
                        altitude: null,
                        altitudeAccuracy: null,
                        heading: null,
                        speed: null
                      },
                      timestamp: Date.now()
                    });
                  }
                };
                navigator.geolocation.watchPosition = function(success) {
                  if (typeof success === 'function') {
                    navigator.geolocation.getCurrentPosition(success);
                  }
                  return 1;
                };
              }

              // Force Always-Active, Unthrottled, Focused State
              try {
                Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
                Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
                document.hasFocus = function() { return true; };
                
                window.addEventListener('visibilitychange', (e) => e.stopImmediatePropagation(), true);
                window.addEventListener('blur', (e) => e.stopImmediatePropagation(), true);
                window.addEventListener('mouseleave', (e) => e.stopImmediatePropagation(), true);
              } catch (e) {}

              console.log('[OmniView Proxy View Active - Anti-Throttled]', {
                url: "${parsedUrl.toString()}",
                simulatedLocation: { ip: "${customClientIp}", country: "${customCountry}", lat, lng },
                simulatedContext: { userAgent: ua, platform: plat, language: lang },
                activeFocusState: 'Forced Parallel Foreground Active'
              });
            } catch (e) {
              console.warn('[OmniView Proxy Override Notice]:', e);
            }
          })();
        </script>
      `;
      html = html.replace('</body>', `${scriptInjector}</body>`);

      return res.status(response.status).send(html);
    } else {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.status(response.status).send(buffer);
    }
  } catch (error) {
    console.error('Proxy request error:', error.message);
    res.status(500).send(`Proxy error: ${error.message}`);
  }
});

// YouTube Channel Video Catalog Resolver
app.get('/api/channel-videos', async (req, res) => {
  const channelInput = req.query.channel;
  if (!channelInput) {
    return res.status(400).json({ success: false, error: 'Missing channel parameter' });
  }

  try {
    let cleanInput = channelInput.trim();
    if (!cleanInput.startsWith('http://') && !cleanInput.startsWith('https://')) {
      if (cleanInput.startsWith('@')) {
        cleanInput = `https://www.youtube.com/${cleanInput}`;
      } else if (cleanInput.startsWith('UC') && cleanInput.length === 24) {
        cleanInput = `https://www.youtube.com/channel/${cleanInput}`;
      } else {
        cleanInput = `https://www.youtube.com/@${cleanInput}`;
      }
    }

    // Append /videos tab if not present
    let fetchUrl = cleanInput;
    if (!fetchUrl.endsWith('/videos') && !fetchUrl.includes('/playlist') && !fetchUrl.includes('watch?v=')) {
      fetchUrl = fetchUrl.replace(/\/$/, '') + '/videos';
    }

    console.log(`[Channel Resolver] Fetching catalog for: ${fetchUrl}`);

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`YouTube responded with HTTP ${response.status}`);
    }

    const html = await response.text();

    // Parse channel title
    let channelTitle = 'YouTube Channel';
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    if (titleMatch) {
      channelTitle = titleMatch[1].replace(' - YouTube', '').trim();
    }

    // Extract video IDs and titles using regex on ytInitialData
    const videoMap = new Map();

    // 1. Search for videoId patterns inside JSON renderer data
    const videoIdMatches = html.matchAll(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g);
    for (const match of videoIdMatches) {
      const vId = match[1];
      if (vId && !videoMap.has(vId)) {
        videoMap.set(vId, { id: vId, title: `${channelTitle} Video (${vId})` });
      }
    }

    // 2. Extract video renderer title objects if available
    const titleMatches = html.matchAll(/"title"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"\}[^}]+"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g);
    for (const match of titleMatches) {
      const vTitle = match[1];
      const vId = match[2];
      if (vId) {
        videoMap.set(vId, { id: vId, title: vTitle });
      }
    }

    // 3. Fallback check for channel ID (UC...) to hit RSS feed for extra fresh video IDs
    const channelIdMatch = html.match(/"channelId"\s*:\s*"([a-zA-Z0-9_-]{24})"/);
    if (channelIdMatch) {
      const channelId = channelIdMatch[1];
      try {
        const rssResponse = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
        if (rssResponse.ok) {
          const xml = await rssResponse.text();
          const rssMatches = xml.matchAll(/<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>\s*<title>([^<]+)<\/title>/g);
          for (const match of rssMatches) {
            const vId = match[1];
            const vTitle = match[2];
            if (vId) {
              videoMap.set(vId, { id: vId, title: vTitle });
            }
          }
        }
      } catch (rssErr) {
        console.warn('RSS feed fetch fallback skipped:', rssErr.message);
      }
    }

    const videos = Array.from(videoMap.values());

    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No public video IDs could be extracted from this channel URL. Make sure it is a valid YouTube channel or playlist.'
      });
    }

    console.log(`[Channel Resolver] Discovered ${videos.length} videos for channel "${channelTitle}"`);

    return res.json({
      success: true,
      channelTitle,
      channelUrl: cleanInput,
      videoCount: videos.length,
      videos
    });
  } catch (error) {
    console.error('Channel resolver error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files from build directory in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'OmniView Proxy Engine & Channel Resolver' });
});

// Single Page Application Fallback Route for non-API requests
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send('OmniView Multi-Tab Studio Backend Active. Run "npm run build" to enable full UI serving.');
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`[OmniView Proxy Engine & App Host] running on http://localhost:${PORT}`);
});
