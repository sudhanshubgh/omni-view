/**
 * Converts a raw URL input into an optimized embeddable or play format.
 */
export function processUrl(rawUrl, options = {}) {
  const { isMuted = false, mode = 'auto', proxyPort = 3001 } = options;
  if (!rawUrl || typeof rawUrl !== 'string') return { type: 'empty', url: '' };

  let trimmed = rawUrl.trim();
  if (!trimmed) return { type: 'empty', url: '' };

  // Add protocol if missing
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('//')) {
    // If it looks like a domain or search, add https://
    if (trimmed.includes('.') && !trimmed.includes(' ')) {
      trimmed = `https://${trimmed}`;
    } else {
      // Treat as YouTube search query fallback
      trimmed = `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmed)}`;
    }
  }

  // Forced proxy mode
  if (mode === 'proxy') {
    const params = new URLSearchParams({ url: trimmed });
    if (options.context) {
      if (options.context.userAgent) params.set('user_agent', options.context.userAgent);
      if (options.context.platform) params.set('platform', options.context.platform);
    }
    if (options.location) {
      if (options.location.ip) params.set('client_ip', options.location.ip);
      if (options.location.code) params.set('country_code', options.location.code);
      if (options.location.language) params.set('lang', options.location.language);
      if (options.location.latitude !== undefined) params.set('lat', options.location.latitude);
      if (options.location.longitude !== undefined) params.set('lng', options.location.longitude);
    }
    return {
      type: 'proxy',
      url: `http://localhost:${proxyPort}/api/proxy?${params.toString()}`,
      originalUrl: trimmed,
      provider: 'CORS Proxy'
    };
  }

  try {
    const urlObj = new URL(trimmed);
    const host = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // 1. YOUTUBE
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let videoId = null;

      if (host.includes('youtu.be')) {
        videoId = pathname.substring(1);
      } else if (pathname.includes('/watch')) {
        videoId = urlObj.searchParams.get('v');
      } else if (pathname.includes('/embed/')) {
        videoId = pathname.split('/embed/')[1]?.split('?')[0];
      } else if (pathname.includes('/shorts/')) {
        videoId = pathname.split('/shorts/')[1]?.split('?')[0];
      } else if (pathname.includes('/live/')) {
        videoId = pathname.split('/live/')[1]?.split('?')[0];
      }

      if (videoId) {
        // Clean videoId from extra path components
        videoId = videoId.split('/')[0].split('&')[0];
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&mute=${isMuted ? 1 : 0}&rel=0&playsinline=1`;
        return {
          type: 'youtube',
          url: embedUrl,
          originalUrl: trimmed,
          videoId,
          provider: 'YouTube'
        };
      }
    }

    // 2. TWITCH
    if (host.includes('twitch.tv')) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        if (parts[0] === 'videos' && parts[1]) {
          const videoId = parts[1];
          return {
            type: 'twitch',
            url: `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname || 'localhost'}&autoplay=true&muted=${isMuted}`,
            originalUrl: trimmed,
            provider: 'Twitch Video'
          };
        } else {
          const channel = parts[0];
          return {
            type: 'twitch',
            url: `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname || 'localhost'}&autoplay=true&muted=${isMuted}`,
            originalUrl: trimmed,
            provider: 'Twitch Stream'
          };
        }
      }
    }

    // 3. VIMEO
    if (host.includes('vimeo.com')) {
      const match = pathname.match(/\/(\d+)/);
      if (match) {
        const vimeoId = match[1];
        return {
          type: 'vimeo',
          url: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=${isMuted ? 1 : 0}`,
          originalUrl: trimmed,
          provider: 'Vimeo'
        };
      }
    }

    // 4. DAILYMOTION
    if (host.includes('dailymotion.com') || host.includes('dai.ly')) {
      let dmId = null;
      if (host.includes('dai.ly')) {
        dmId = pathname.substring(1);
      } else if (pathname.includes('/video/')) {
        dmId = pathname.split('/video/')[1]?.split('?')[0];
      }
      if (dmId) {
        return {
          type: 'dailymotion',
          url: `https://www.dailymotion.com/embed/video/${dmId}?autoplay=1&mute=${isMuted ? 1 : 0}`,
          originalUrl: trimmed,
          provider: 'Dailymotion'
        };
      }
    }

    // 5. DIRECT MEDIA FILES (.mp4, .webm, .m3u8, .mp3, etc.)
    const lowerPath = pathname.toLowerCase();
    if (
      lowerPath.endsWith('.mp4') ||
      lowerPath.endsWith('.webm') ||
      lowerPath.endsWith('.ogv') ||
      lowerPath.endsWith('.mov') ||
      lowerPath.endsWith('.mp3') ||
      lowerPath.endsWith('.m3u8')
    ) {
      return {
        type: 'direct-media',
        url: trimmed,
        originalUrl: trimmed,
        provider: lowerPath.endsWith('.mp3') ? 'Audio Stream' : 'Video Stream'
      };
    }

    // Standard website iframe
    return {
      type: 'web',
      url: trimmed,
      originalUrl: trimmed,
      provider: getDomainName(host)
    };
  } catch (err) {
    return {
      type: 'web',
      url: trimmed,
      originalUrl: trimmed,
      provider: 'Web'
    };
  }
}

export function getDomainName(hostname) {
  if (!hostname) return 'Web Pane';
  const clean = hostname.replace('www.', '');
  const parts = clean.split('.');
  if (parts.length > 0) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  return clean;
}

export const PRESET_WORKSPACES = [
  {
    id: 'lofi-relax',
    name: '🎵 Lo-Fi Beats & Relax Wall',
    description: 'Concurrent 24/7 Lo-Fi music streams and ambient visualizers',
    layout: '2x2',
    tabs: [
      { url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', title: 'Lofi Girl Live Beats', isMuted: false, volume: 0.8 },
      { url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY', title: 'Chillhop Radio', isMuted: true, volume: 0.5 },
      { url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', title: 'Lofi Hip Hop Synthwave', isMuted: true, volume: 0.5 },
      { url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c', title: 'Peaceful Piano Stream', isMuted: true, volume: 0.5 }
    ]
  },
  {
    id: 'space-earth',
    name: '🚀 Space & Earth Multi-Stream',
    description: 'Live ISS cameras, NASA TV, and Earth views playing together',
    layout: '2x2',
    tabs: [
      { url: 'https://www.youtube.com/watch?v=P9C25Un7qpY', title: 'NASA Live Stream', isMuted: false, volume: 0.7 },
      { url: 'https://www.youtube.com/watch?v=21X5lGlDOfg', title: 'Earth From Space Live', isMuted: true, volume: 0.5 },
      { url: 'https://www.youtube.com/watch?v=xRPjK7Bq2sw', title: 'SpaceX Mission Stream', isMuted: true, volume: 0.5 },
      { url: 'https://www.youtube.com/watch?v=Xh0l0t1k1u0', title: 'Deep Space Visuals', isMuted: true, volume: 0.5 }
    ]
  },
  {
    id: 'nature-4k',
    name: '🌿 4K Nature & Ocean Views',
    description: 'Relaxing 4K scenic landscapes and aquatic environments',
    layout: '2x2',
    tabs: [
      { url: 'https://www.youtube.com/watch?v=BHACKCNDMW8', title: 'Coral Reef Aquarium', isMuted: false, volume: 0.6 },
      { url: 'https://www.youtube.com/watch?v=1Zyb3cGE5bU', title: 'Forest & River Sounds', isMuted: true, volume: 0.5 },
      { url: 'https://www.youtube.com/watch?v=f02g8M_BfA4', title: 'Ocean Waves & Sunset', isMuted: true, volume: 0.5 },
      { url: 'https://www.youtube.com/watch?v=668nUCeBHyY', title: 'Rain & Thunderstorms', isMuted: true, volume: 0.5 }
    ]
  },
  {
    id: 'tech-news',
    name: '📰 Tech & News Dashboard',
    description: 'Simultaneous active news portals and live feeds',
    layout: '2x2',
    tabs: [
      { url: 'https://en.wikipedia.org/wiki/Portal:Current_events', title: 'Wikipedia Current Events', isMuted: true, mode: 'direct' },
      { url: 'https://news.ycombinator.com', title: 'Hacker News', isMuted: true, mode: 'direct' },
      { url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE', title: 'Bloomberg Global Tech', isMuted: false, volume: 0.7 },
      { url: 'https://www.youtube.com/watch?v=2g811Eo7K8U', title: 'Sky News Live Feed', isMuted: true, volume: 0.5 }
    ]
  }
];
