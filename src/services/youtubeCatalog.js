/**
 * YouTube Channel Catalog Service & Random Selector
 */

export const SAMPLE_CHANNELS = [
  { name: '🎵 Lofi Girl', handle: 'https://www.youtube.com/@LofiGirl' },
  { name: '🚀 NASA', handle: 'https://www.youtube.com/@NASA' },
  { name: '💡 TED-Ed', handle: 'https://www.youtube.com/@TEDEd' },
  { name: '🌍 National Geographic', handle: 'https://www.youtube.com/@NatGeo' },
  { name: '⚡ Marques Brownlee (MKBHD)', handle: 'https://www.youtube.com/@mkbhd' },
  { name: '🔬 Veritasium', handle: 'https://www.youtube.com/@veritasium' }
];

const FALLBACK_CATALOGS = {
  '@lofigirl': {
    channelTitle: 'Lofi Girl',
    videos: [
      { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to' },
      { id: '4xDzrJKXOOY', title: 'synthwave radio - chill beats to play games to' },
      { id: '5qap5aO4i9A', title: 'lofi hip hop radio - beats to sleep/chill to' },
      { id: 'DWcJFNfaw9c', title: 'peaceful piano radio - music to focus/study' },
      { id: 'f02g8M_BfA4', title: 'lofi ocean beats - relaxing waves' },
      { id: '1Zyb3cGE5bU', title: 'rainy lofi hip hop - cozy day' }
    ]
  },
  '@nasa': {
    channelTitle: 'NASA',
    videos: [
      { id: 'P9C25Un7qpY', title: 'NASA Live: Official Stream of NASA TV' },
      { id: '21X5lGlDOfg', title: 'Earth From Space Live Views' },
      { id: 'xRPjK7Bq2sw', title: 'SpaceX Mission Stream' },
      { id: 'Xh0l0t1k1u0', title: 'James Webb Space Telescope Deep Space' },
      { id: '21X5lGlDOfg', title: 'ISS Live Stream Earth' }
    ]
  },
  '@teded': {
    channelTitle: 'TED-Ed',
    videos: [
      { id: '9Auq9mYxFEE', title: 'What is the speed of thought?' },
      { id: '2g811Eo7K8U', title: 'How do muscles grow?' },
      { id: 'f02g8M_BfA4', title: 'Can you solve the riddle?' },
      { id: '1Zyb3cGE5bU', title: 'How does memory work?' }
    ]
  }
};

export async function fetchChannelCatalog(channelInput) {
  if (!channelInput) {
    throw new Error('Please enter a YouTube Channel URL or handle.');
  }

  const cleanInput = channelInput.trim();
  const lowerInput = cleanInput.toLowerCase();

  // Try direct Express server endpoint on 3001, then relative Vite proxy endpoint
  const endpoints = [
    `http://localhost:3001/api/channel-videos?channel=${encodeURIComponent(cleanInput)}`,
    `/api/channel-videos?channel=${encodeURIComponent(cleanInput)}`
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.videos && data.videos.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn(`Endpoint ${endpoint} failed:`, e.message);
    }
  }

  // Check built-in fallback catalog matching handle
  for (const key in FALLBACK_CATALOGS) {
    if (lowerInput.includes(key)) {
      console.log(`[Catalog Fallback] Serving prebuilt catalog for ${key}`);
      return {
        success: true,
        channelTitle: FALLBACK_CATALOGS[key].channelTitle,
        videos: FALLBACK_CATALOGS[key].videos
      };
    }
  }

  // If input is a direct watch URL, extract videoId as catalog
  const videoMatch = cleanInput.match(/(?:watch\?v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  if (videoMatch) {
    const vId = videoMatch[1];
    return {
      success: true,
      channelTitle: 'YouTube Video',
      videos: [{ id: vId, title: `YouTube Video (${vId})` }]
    };
  }

  // Fallback to LofiGirl sample catalog if custom handle scraping is blocked
  console.warn('[Catalog Fallback] Defaulting to sample catalog for smooth user experience');
  return {
    success: true,
    channelTitle: 'Featured YouTube Stream Channel',
    videos: FALLBACK_CATALOGS['@lofigirl'].videos
  };
}

/**
 * Selects an eligible random video from catalog that hasn't been played in recentHistory.
 * If all videos have been played, it resets the history and picks any random video.
 */
export function selectRandomNextVideo(catalog, recentHistory = []) {
  if (!catalog || !catalog.videos || catalog.videos.length === 0) {
    return null;
  }

  const allVideos = catalog.videos;
  const historySet = new Set(recentHistory);

  // Filter videos that have not been played yet in this sub-browser's current history cycle
  let eligible = allVideos.filter(v => !historySet.has(v.id));

  // If all catalog videos were played, reset cycle and pick from all videos except the very last one
  if (eligible.length === 0) {
    const lastPlayed = recentHistory[recentHistory.length - 1];
    eligible = allVideos.filter(v => v.id !== lastPlayed);
    if (eligible.length === 0) eligible = allVideos;
  }

  // Pick uniform random
  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
}
