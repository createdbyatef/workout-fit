/**
 * Utility functions for formatting time and dates in Set Counter
 */

/**
 * Formats seconds into MM:SS format (e.g. 125s -> "02:05")
 */
export function formatMMSS(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats seconds into human-readable duration like "20m 00s" or "45s"
 */
export function formatSplitTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

/**
 * Formats total seconds into workout duration (e.g., "20 min" or "19 min 30s")
 */
export function formatTotalDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  if (secs === 0) {
    return `${mins} min`;
  }
  return `${mins}m ${secs}s`;
}

/**
 * Formats timestamp into localized date string (Malay locale / readable)
 */
export function formatSessionDate(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ms-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    const d = new Date(timestamp);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
}

