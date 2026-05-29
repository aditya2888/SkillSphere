const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Derive API base (strip trailing /api)
const API_BASE = API.replace(/\/api\/?$/i, '');

/**
 * Resolve any stored media URL to a displayable URL.
 *
 * Handles:
 *  - azblob://container/blobName   → proxied through /api/media/redirect for SAS signing
 *  - https://...blob.core.windows.net/...  → proxied through /api/media/redirect for SAS signing
 *  - /uploads/...  → local dev file path, prepended with backend base
 *  - '' / null / undefined → ''
 */
function getFileUrl(url) {
    if (!url) return '';

    // Already a data URL (unlikely but safe)
    if (url.startsWith('data:')) return url;

    // Azure blob scheme we store (azblob://container/blob)
    if (url.startsWith('azblob://')) {
        return `${API}/media/redirect?url=${encodeURIComponent(url)}`;
    }

    // Legacy full Azure blob URL (stored before we switched to azblob:// scheme)
    if (url.includes('.blob.core.windows.net/')) {
        return `${API}/media/redirect?url=${encodeURIComponent(url)}`;
    }

    // Local file path (relative URL starting with /)
    if (url.startsWith('/')) {
        return `${API_BASE}${url}`;
    }

    // Fallback — return as-is (already a full URL)
    return url;
}

export { API, API_BASE, getFileUrl };
