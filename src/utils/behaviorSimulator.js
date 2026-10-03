/**
 * Human Behavior Simulation Engine for Sub-Browsers
 * Handles:
 * 1. Randomized Watch Durations (watch thresholds between 45% and 88%)
 * 2. Staggered Launch Delays (staggered startup offsets from 2s to 15s)
 * 3. Session Interactivity Jitter (micro volume changes, brief pauses, container scrolls)
 * 4. Variable Identity Lifecycles (mid-session identity rotation intervals)
 */

/**
 * Returns a random watch completion target percentage (e.g. 52% to 88%).
 */
export function getRandomWatchThreshold(minPercent = 52, maxPercent = 88) {
  return Math.floor(Math.random() * (maxPercent - minPercent + 1)) + minPercent;
}

/**
 * Calculates a staggered launch delay offset in milliseconds for a sub-browser index.
 * Example: Sub-browser 0 starts after ~0.5s, sub-browser 1 after ~3s, sub-browser 2 after ~6s, etc.
 */
export function getStaggeredLaunchDelayMs(browserIndex = 0, baseStepMs = 2500, jitterMs = 2000) {
  if (browserIndex === 0) return 500;
  return Math.floor(browserIndex * baseStepMs + Math.random() * jitterMs);
}

/**
 * Returns a randomized mid-session identity rotation interval in milliseconds (e.g. 75s to 180s).
 */
export function getMidSessionRotationIntervalMs(minSeconds = 75, maxSeconds = 180) {
  return Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) * 1000;
}

/**
 * Probabilistically determines if an interactivity jitter event should occur,
 * and returns the jitter type: 'volume_nudge', 'pause_resume', or 'none'.
 */
export function generateInteractivityJitter(currentVolume = 0.8) {
  const roll = Math.random();
  
  if (roll < 0.40) {
    // Volume micro-adjustment (±5% to ±12%)
    const delta = (Math.random() * 0.14 - 0.07);
    const newVol = Math.max(0.1, Math.min(1.0, parseFloat((currentVolume + delta).toFixed(2))));
    return {
      type: 'volume_nudge',
      newVolume: newVol,
      description: `Micro volume adjustment: ${Math.round(newVol * 100)}%`
    };
  } else if (roll < 0.70) {
    // Brief natural pause & resume (1.5s to 3s)
    const pauseDurationMs = Math.floor(1500 + Math.random() * 1500);
    return {
      type: 'pause_resume',
      pauseDurationMs,
      description: `Brief natural pause (${(pauseDurationMs / 1000).toFixed(1)}s)`
    };
  } else {
    // Micro scroll / layout shift
    return {
      type: 'micro_scroll',
      description: 'Micro container scroll adjustment'
    };
  }
}
